"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/utils";
import { Collection } from "@/types";
import CollectionCard from "@/components/CollectionCard";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  const [collections, setCollections] = useState<(Collection & { tweet_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    await supabase.auth.getSession();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    let { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (!profile) {
      const fallbackUsername = (user.email?.split("@")[0] || "user") + "_" + user.id.slice(0, 4);
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: fallbackUsername.toLowerCase(),
          display_name: fallbackUsername,
        })
        .select("username")
        .single();
      profile = newProfile;
    }

    if (profile) setUsername(profile.username);

    const { data: cols } = await supabase
      .from("collections")
      .select("*, collection_tweets(count)")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    if (cols) {
      const mapped = cols.map((c) => ({
        ...c,
        tweet_count: (c.collection_tweets as unknown as { count: number }[])?.[0]?.count ?? 0,
      }));
      setCollections(mapped);
    }
    setLoading(false);
  }

  async function createCollection(e: React.FormEvent) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("collections").insert({
      user_id: user.id,
      name: newName,
      slug: generateSlug(newName),
      emoji: newEmoji || null,
      description: newDescription || null,
      position: collections.length,
    });

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    setNewName("");
    setNewEmoji("");
    setNewDescription("");
    setShowCreate(false);
    loadData();
  }

  async function deleteCollection(id: string) {
    if (!confirm("Delete this collection? This cannot be undone.")) return;
    await supabase.from("collections").delete().eq("id", id);
    loadData();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
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
        <div className="flex items-center gap-2 sm:gap-3">
          {username && (
            <>
              <ShareButton
                url={`${typeof window !== "undefined" ? window.location.origin : ""}/${username}`}
                text={`Check out my curated tweet collections on Curio!`}
              />
              <Link
                href={`/${username}`}
                className="text-[0.8rem] sm:text-[0.85rem] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors hidden sm:block"
                target="_blank"
              >
                View profile
              </Link>
            </>
          )}
          <button
            onClick={handleLogout}
            className="text-[0.85rem] font-medium text-[var(--text-muted)] hover:text-red-500 transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 pt-[100px] sm:pt-[140px] pb-20">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-[40px] sm:mb-[60px]">
          <div>
            <span className="uppercase tracking-[0.1em] text-xs font-semibold text-[var(--text-muted)] mb-2 block">
              Dashboard
            </span>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-medium italic tracking-[-0.02em] uppercase leading-none"
              style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
            >
              Your Collections
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="inline-flex items-center justify-center px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-[0.85rem] sm:text-[0.95rem] font-semibold bg-[var(--text-main)] text-white shadow-[0_8px_16px_rgba(42,40,38,0.1)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(42,40,38,0.15)] transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Collection
          </button>
        </header>

        {/* Create form */}
        {showCreate && (
          <form
            onSubmit={createCollection}
            className="bg-white rounded-[24px] p-8 mb-10 border border-black/[0.03] shadow-[var(--shadow-soft)]"
          >
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                placeholder="Collection name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="flex-1 px-4 py-3 border border-black/10 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-[var(--bg-base)]"
              />
            </div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-4 py-3 border border-black/10 rounded-[12px] text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-black/10 bg-[var(--bg-base)]"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-5 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[var(--text-main)] text-white rounded-full text-sm font-semibold shadow-[0_8px_16px_rgba(42,40,38,0.1)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(42,40,38,0.15)] transition-all"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {/* Collections grid */}
        {collections.length === 0 ? (
          <div className="py-20 px-10 text-center border-2 border-dashed border-black/[0.08] rounded-[24px] bg-white/20">
            <p className="text-4xl mb-4">{"\u{1F4C2}"}</p>
            <p className="text-[var(--text-muted)] mb-2">No collections yet</p>
            <p className="text-sm text-[var(--text-muted)]">
              Create your first collection to start curating your best tweets
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {collections.map((col, index) => (
              <CollectionCard
                key={col.id}
                collection={col}
                tweetCount={col.tweet_count}
                href={`/dashboard/collections/${col.id}`}
                onDelete={() => deleteCollection(col.id)}
                index={index}
              />
            ))}
            {/* Add collection card */}
            <button
              onClick={() => setShowCreate(true)}
              className="border-2 border-dashed border-black/[0.05] rounded-[24px] min-h-[240px] flex items-center justify-center bg-transparent hover:border-black/10 transition-colors cursor-pointer"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span className="uppercase tracking-[0.1em] text-xs font-semibold text-[var(--text-muted)]">
                  Add Collection
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
