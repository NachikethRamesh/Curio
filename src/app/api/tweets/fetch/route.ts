import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTweetId, fetchTweetOEmbed, normalizeHandle, extractHandleFromAuthorUrl } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, collection_id } = await request.json();

  if (!url || !collection_id) {
    return NextResponse.json(
      { error: "url and collection_id are required" },
      { status: 400 }
    );
  }

  const tweetId = extractTweetId(url);
  if (!tweetId) {
    return NextResponse.json(
      { error: "Invalid tweet URL" },
      { status: 400 }
    );
  }

  // Verify collection belongs to user
  const { data: collection } = await supabase
    .from("collections")
    .select("id, user_id")
    .eq("id", collection_id)
    .single();

  if (!collection || collection.user_id !== user.id) {
    return NextResponse.json(
      { error: "Collection not found" },
      { status: 404 }
    );
  }

  // Get user's verified X handle
  const { data: profile } = await supabase
    .from("profiles")
    .select("x_handle")
    .eq("id", user.id)
    .single();

  // Check if tweet already cached
  const { data: existingTweet } = await supabase
    .from("tweets")
    .select("*")
    .eq("id", tweetId)
    .single();

  let tweet = existingTweet;

  // If cached, verify ownership before allowing add
  if (tweet && profile?.x_handle) {
    if (tweet.author_handle && normalizeHandle(tweet.author_handle) !== normalizeHandle(profile.x_handle)) {
      return NextResponse.json(
        { error: "You can only save your own tweets" },
        { status: 403 }
      );
    }
  }

  if (!tweet) {
    // Fetch via oEmbed (free, no auth needed)
    const oembed = await fetchTweetOEmbed(url);
    if (!oembed) {
      return NextResponse.json(
        { error: "Could not fetch tweet. It may be private or deleted." },
        { status: 404 }
      );
    }

    // Extract handle from author_url
    const authorHandle = oembed.author_url
      ? extractHandleFromAuthorUrl(oembed.author_url)
      : null;

    // Verify tweet belongs to this user
    if (profile?.x_handle && authorHandle && normalizeHandle(authorHandle) !== normalizeHandle(profile.x_handle)) {
      return NextResponse.json(
        { error: "You can only save your own tweets" },
        { status: 403 }
      );
    }

    const { data: newTweet, error } = await supabase
      .from("tweets")
      .insert({
        id: tweetId,
        author_handle: authorHandle,
        author_name: oembed.author_name,
        embed_html: oembed.html,
        tweet_url: url,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to save tweet" },
        { status: 500 }
      );
    }
    tweet = newTweet;
  }

  // Check if already in this collection
  const { data: existing } = await supabase
    .from("collection_tweets")
    .select("id")
    .eq("collection_id", collection_id)
    .eq("tweet_id", tweetId)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Tweet already in this collection", tweet },
      { status: 409 }
    );
  }

  // Get next position
  const { count } = await supabase
    .from("collection_tweets")
    .select("*", { count: "exact", head: true })
    .eq("collection_id", collection_id);

  const { error: linkError } = await supabase
    .from("collection_tweets")
    .insert({
      collection_id,
      tweet_id: tweetId,
      position: count ?? 0,
    });

  if (linkError) {
    return NextResponse.json(
      { error: "Failed to add tweet to collection" },
      { status: 500 }
    );
  }

  return NextResponse.json({ tweet });
}
