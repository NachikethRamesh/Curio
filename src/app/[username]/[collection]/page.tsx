export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username)
    .single();

  if (!profile) notFound();

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

  const { data: allCollections } = await supabase
    .from("collections")
    .select("id, name, emoji, slug")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("position", { ascending: true });

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
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-[1200px] z-50 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/90 bg-white/70 backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
        <Link href="/" className="flex items-center gap-1.5">
          <img src="/logo-sm.png" alt="" className="w-14 h-14 object-contain" />
          <span
            className="text-[1.2rem] sm:text-[1.4rem] font-medium italic tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
          >
            Curio.
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <CollectionDropdown
            collections={allCollections || []}
            currentId={collection.id}
            username={username}
          />
          <Link
            href="/signup"
            className="px-4 sm:px-5 py-2 text-[0.8rem] sm:text-[0.85rem] font-medium bg-[var(--text-main)] text-white rounded-full shadow-[0_8px_16px_rgba(42,40,38,0.15)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(42,40,38,0.2)] transition-all"
          >
            Create yours for free
          </Link>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 pt-[100px] sm:pt-[140px] pb-20">
        {/* Header */}
        <header className="mb-10">
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-2 text-[var(--text-muted)] text-sm hover:text-[var(--text-main)] transition-colors mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            {profile.display_name || username}&apos;s profile
          </Link>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-medium italic tracking-[-0.02em] leading-none flex items-center gap-4"
            style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
          >
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-[var(--text-muted)] mt-3 max-w-2xl leading-relaxed">{collection.description}</p>
          )}
        </header>

        {/* Tweets */}
        {tweets.length === 0 ? (
          <div className="py-20 px-10 text-center border-2 border-dashed border-black/[0.08] rounded-[24px] bg-white/20">
            <p className="text-[var(--text-muted)]">No tweets in this collection yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tweets.map((tweet, index) => (
              <TweetCard key={tweet.id} tweet={tweet} colorIndex={index} />
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <footer className="text-center py-[40px] sm:py-[80px] px-4 sm:px-10">
        <div className="bg-white/75 backdrop-blur-[24px] border border-white/90 rounded-[24px] sm:rounded-[48px] py-10 sm:py-16 px-6 sm:px-10 max-w-[700px] mx-auto shadow-[var(--shadow-float)]">
          <h2
            className="text-[1.8rem] sm:text-[2.5rem] tracking-[-0.02em] mb-4"
            style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
          >
            Your best tweets deserve more than a timeline
          </h2>
          <p className="text-[1rem] text-[var(--text-muted)] mb-8">
            Curate, organize, and share your tweets — free with Curio.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-[0.95rem] font-semibold bg-[var(--text-main)] text-white shadow-[0_8px_16px_rgba(42,40,38,0.15)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(42,40,38,0.2)] transition-all"
          >
            Get started for free
          </Link>
        </div>
      </footer>
      <Footer />

      <script async src="https://platform.twitter.com/widgets.js" />
    </div>
  );
}
