export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import TweetCard from "@/components/TweetCard";
import CollectionDropdown from "@/components/CollectionDropdown";

interface Props {
  params: Promise<{ username: string; collection: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, collection: collectionSlug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (!profile) return { title: "Not Found" };

  let { data: col } = await supabase
    .from("collections")
    .select("name, description")
    .eq("slug", collectionSlug)
    .eq("user_id", profile.id)
    .single();

  if (!col) {
    const { data: colById } = await supabase
      .from("collections")
      .select("name, description")
      .eq("id", collectionSlug)
      .eq("user_id", profile.id)
      .single();
    col = colById;
  }

  if (!col) return { title: "Not Found" };

  const title = `${col.name} by @${username} - Curio`;
  const description = col.description || `A curated collection of tweets by @${username}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "Curio",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: `@${username}`,
    },
  };
}

export default async function PublicCollectionPage({ params }: Props) {
  const { username, collection: collectionSlug } = await params;
  const supabase = await createClient();

  // Verify profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  // Get collection by slug, fall back to id for backwards compatibility
  let { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", collectionSlug)
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .single();

  if (!collection) {
    const { data: colById } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionSlug)
      .eq("user_id", profile.id)
      .eq("is_public", true)
      .single();
    collection = colById;
  }

  if (!collection) notFound();

  // Get all public collections for the dropdown
  const { data: allCollections } = await supabase
    .from("collections")
    .select("id, name, emoji, slug")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("position", { ascending: true });

  // Get tweets
  const { data: links } = await supabase
    .from("collection_tweets")
    .select("tweet_id")
    .eq("collection_id", collection.id)
    .order("position", { ascending: true });

  let tweets: { id: string; embed_html: string | null; tweet_url: string; author_handle: string | null; author_name: string | null; content: string | null; created_at: string | null; fetched_at: string }[] = [];

  if (links && links.length > 0) {
    const tweetIds = links.map((l) => l.tweet_id);
    const { data: tweetData } = await supabase
      .from("tweets")
      .select("*")
      .in("id", tweetIds);

    if (tweetData) {
      tweets = links
        .map((l) => tweetData.find((t) => t.id === l.tweet_id))
        .filter(Boolean) as typeof tweets;
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 sm:px-10 pt-10 pb-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-2 bg-[#F4F4F5] px-4 py-2 rounded-full text-sm font-medium text-black hover:bg-[#E4E4E7] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            {profile.display_name || username}&apos;s profile
          </Link>
          <CollectionDropdown
            collections={allCollections || []}
            currentId={collection.id}
            username={username}
          />
        </div>
        <h1 className="text-4xl sm:text-5xl font-normal tracking-tight uppercase flex items-center gap-4">
          <span>{collection.emoji || "\u{1F4C1}"}</span>
          {collection.name}
        </h1>
        {collection.description && (
          <p className="text-[var(--text-muted)] mt-3 max-w-2xl leading-relaxed">{collection.description}</p>
        )}
      </header>

      {/* Tweets */}
      <div className="px-6 sm:px-10 py-8">
        {tweets.length === 0 ? (
          <p className="text-center text-[var(--text-light)] py-12">
            No tweets in this collection yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tweets.map((tweet, index) => (
              <TweetCard key={tweet.id} tweet={tweet} colorIndex={index} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-[var(--text-light)] font-medium uppercase tracking-wider">
        <Link href="/" className="hover:text-black transition-colors">
          Powered by Curio
        </Link>
      </footer>

      {/* Twitter widget script for rendering embeds */}
      <script async src="https://platform.twitter.com/widgets.js" />
    </div>
  );
}
