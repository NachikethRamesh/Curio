"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/utils";
import { Collection } from "@/types";
import CollectionCard from "@/components/CollectionCard";
import ShareButton from "@/components/ShareButton";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    // getSession() refreshes expired tokens using the refresh token
    await supabase.auth.getSession();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Get profile, create if missing (handles failed signup edge case)
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

    // Get collections with tweet counts
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
        <p className="text-[var(--text-light)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-5">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Curio
        </Link>
        <div className="flex items-center gap-3">
          {username && (
            <>
              <ShareButton
                url={`${typeof window !== "undefined" ? window.location.origin : ""}/${username}`}
                text={`Check out my curated tweet collections on Curio!`}
              />
              <Link
                href={`/${username}`}
                className="text-sm text-[var(--text-muted)] hover:text-black transition-colors"
                target="_blank"
              >
                View profile
              </Link>
            </>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-[var(--text-muted)] hover:text-red-500 transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl sm:text-4xl font-normal tracking-tight uppercase">Your Collections</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            + New Collection
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <form
            onSubmit={createCollection}
            className="bg-[#F4F4F5] rounded-[24px] p-8 mb-8"
          >
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                placeholder="Collection name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
              />
            </div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-5 py-2.5 text-sm text-[var(--text-muted)] hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {/* Collections grid */}
        {collections.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">{"\u{1F4C2}"}</p>
            <p className="text-[var(--text-muted)] mb-2">No collections yet</p>
            <p className="text-sm text-[var(--text-light)]">
              Create your first collection to start curating your best tweets
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          </div>
        )}
      </div>
    </div>
  );
}
