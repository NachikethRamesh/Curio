export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio")
    .eq("username", username)
    .single();

  if (!profile) return { title: "Not Found" };

  const title = `${profile.display_name || username} - Curio`;
  const description = profile.bio || `Check out @${username}'s curated tweet collections on Curio`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
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

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const { data: collections } = await supabase
    .from("collections")
    .select("*, collection_tweets(count)")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("position", { ascending: true });

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-[1200px] z-50 flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full border border-white/90 bg-white/70 backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
        <Link
          href="/"
          className="text-[1.2rem] sm:text-[1.4rem] font-medium italic tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
        >
          Curio.
        </Link>
        <Link
          href="/signup"
          className="px-4 sm:px-5 py-2 text-[0.8rem] sm:text-[0.85rem] font-medium bg-[var(--text-main)] text-white rounded-full shadow-[0_8px_16px_rgba(42,40,38,0.15)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(42,40,38,0.2)] transition-all"
        >
          Create yours for free
        </Link>
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 pt-[100px] sm:pt-[140px] pb-20">
        {/* Profile header */}
        <header className="mb-[40px] sm:mb-[60px]">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-medium italic tracking-[-0.02em] uppercase leading-none mb-3"
            style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
          >
            {profile.display_name || profile.username}
          </h1>
          {profile.x_handle && (
            <a
              href={`https://x.com/${profile.x_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--text-muted)] text-sm hover:text-[var(--text-main)] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              @{profile.x_handle}
            </a>
          )}
          {profile.bio && (
            <p className="text-[var(--text-muted)] max-w-xl mt-3 leading-relaxed">{profile.bio}</p>
          )}
        </header>

        {/* Collections grid */}
        {!collections || collections.length === 0 ? (
          <div className="py-20 px-10 text-center border-2 border-dashed border-black/[0.08] rounded-[24px] bg-white/20">
            <p className="text-[var(--text-muted)]">No collections yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {collections.map((col) => {
              const tweetCount =
                (col.collection_tweets as unknown as { count: number }[])?.[0]
                  ?.count ?? 0;
              return (
                <Link
                  key={col.id}
                  href={`/${username}/${col.slug || col.id}`}
                  className="block bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 border border-black/[0.03] shadow-[0_12px_32px_rgba(42,40,38,0.04),0_4px_8px_rgba(42,40,38,0.02)] hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(42,40,38,0.06),0_8px_16px_rgba(42,40,38,0.03)] hover:border-black/[0.06] transition-all duration-400 min-h-[180px] sm:min-h-[240px] flex flex-col justify-between"
                  style={{ transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}
                >
                  <div>
                    <h3
                      className="text-[1.4rem] sm:text-[1.8rem] italic font-normal leading-[1.2] mb-2 pr-8"
                      style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
                    >
                      {col.name}
                    </h3>
                    <span className="uppercase tracking-[0.1em] text-xs font-semibold text-[var(--text-muted)]">
                      {tweetCount} tweet{tweetCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {col.description && (
                    <p className="text-sm text-[var(--text-muted)] mt-4 line-clamp-2">
                      {col.description}
                    </p>
                  )}
                </Link>
              );
            })}
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
    </div>
  );
}
