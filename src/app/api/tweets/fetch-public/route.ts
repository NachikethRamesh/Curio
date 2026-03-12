import { NextResponse } from "next/server";
import { extractTweetId, fetchTweetOEmbed, extractHandleFromAuthorUrl } from "@/lib/utils";

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json(
      { error: "url is required" },
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

  const oembed = await fetchTweetOEmbed(url);
  if (!oembed) {
    return NextResponse.json(
      { error: "Could not fetch tweet. It may be private or deleted." },
      { status: 404 }
    );
  }

  const authorHandle = oembed.author_url
    ? extractHandleFromAuthorUrl(oembed.author_url)
    : null;

  return NextResponse.json({
    tweet: {
      id: tweetId,
      author_handle: authorHandle,
      author_name: oembed.author_name,
      embed_html: oembed.html,
      tweet_url: url,
      created_at: null,
      fetched_at: new Date().toISOString(),
    },
  });
}
