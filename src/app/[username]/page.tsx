export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

const PASTEL_COLORS = [
  "bg-[#DCFBC7]",
  "bg-[#CEF3FD]",
  "bg-[#DFEDFD]",
  "bg-[#FEF6D0]",
  "bg-[#EFE7FD]",
  "bg-[#FDDADA]",
];

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 sm:px-10 pt-10 pb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#F4F4F5] px-4 py-2 rounded-full text-sm font-medium text-black hover:bg-[#E4E4E7] transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Curio
        </Link>
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl sm:text-5xl font-normal tracking-tight uppercase">
            {profile.display_name || profile.username}
          </h1>
        </div>
        {profile.x_handle && (
          <a
            href={`https://x.com/${profile.x_handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[var(--text-muted)] text-sm hover:text-black transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            @{profile.x_handle}
          </a>
        )}
        {profile.bio && (
          <p className="text-[var(--text-muted)] max-w-xl mt-3 leading-relaxed">{profile.bio}</p>
        )}
      </header>

      {/* Collections */}
      <div className="px-6 sm:px-10 py-8">
        {!collections || collections.length === 0 ? (
          <p className="text-center text-[var(--text-light)] py-12">
            No collections yet
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collections.map((col, index) => {
              const tweetCount =
                (col.collection_tweets as unknown as { count: number }[])?.[0]
                  ?.count ?? 0;
              const colorClass = PASTEL_COLORS[index % PASTEL_COLORS.length];
              return (
                <Link
                  key={col.id}
                  href={`/${username}/${col.slug || col.id}`}
                  className={`${colorClass} rounded-[var(--radius-card)] p-8 hover:scale-[1.02] transition-transform block`}
                >
                  <div className="text-3xl mb-3">{col.emoji || "\u{1F4C1}"}</div>
                  <h3 className="font-semibold text-lg mb-1">{col.name}</h3>
                  {col.description && (
                    <p className="text-sm text-black/50 mb-3 line-clamp-2">
                      {col.description}
                    </p>
                  )}
                  <p className="text-xs font-medium text-black/40 uppercase tracking-wider">
                    {tweetCount} tweet{tweetCount !== 1 ? "s" : ""}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-10 text-sm text-[var(--text-light)] font-medium uppercase tracking-wider">
        <Link href="/" className="hover:text-black transition-colors">
          Powered by Curio
        </Link>
      </footer>
    </div>
  );
}
