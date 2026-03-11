"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Collection, Tweet } from "@/types";
import { generateSlug } from "@/lib/utils";
import TweetCard from "@/components/TweetCard";
import ShareButton from "@/components/ShareButton";
import CollectionDropdown from "@/components/CollectionDropdown";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function CollectionEditorPage() {
  const params = useParams();
  const collectionId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [tweetUrl, setTweetUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEmoji, setEditEmoji] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [allCollections, setAllCollections] = useState<{ id: string; name: string; emoji: string | null }[]>([]);

  // Drag and drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  useEffect(() => {
    loadCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  async function loadCollection() {
    // getSession() refreshes expired tokens using the refresh token
    await supabase.auth.getSession();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: col } = await supabase
      .from("collections")
      .select("*")
      .eq("id", collectionId)
      .eq("user_id", user.id)
      .single();

    if (!col) {
      router.push("/dashboard");
      return;
    }

    // Fetch username for share link
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    if (profile) setUsername(profile.username);

    // Fetch all collections for the dropdown switcher
    const { data: cols } = await supabase
      .from("collections")
      .select("id, name, emoji")
      .eq("user_id", user.id)
      .order("position", { ascending: true });
    if (cols) setAllCollections(cols);

    setCollection(col);
    setEditName(col.name);
    setEditDescription(col.description || "");
    setEditEmoji(col.emoji || "");

    // Get tweets in this collection
    const { data: links } = await supabase
      .from("collection_tweets")
      .select("tweet_id, position")
      .eq("collection_id", collectionId)
      .order("position", { ascending: true });

    if (links && links.length > 0) {
      const tweetIds = links.map((l) => l.tweet_id);
      const { data: tweetData } = await supabase
        .from("tweets")
        .select("*")
        .in("id", tweetIds);

      if (tweetData) {
        // Sort by the position from collection_tweets
        const ordered = links
          .map((l) => tweetData.find((t) => t.id === l.tweet_id))
          .filter(Boolean) as Tweet[];
        setTweets(ordered);
      }
    } else {
      setTweets([]);
    }

    setLoading(false);
  }

  async function addTweet(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError(null);

    const res = await fetch("/api/tweets/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: tweetUrl, collection_id: collectionId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setAddError(data.error);
      setAdding(false);
      return;
    }

    setTweetUrl("");
    setAdding(false);
    loadCollection();
  }

  async function removeTweet(tweetId: string) {
    await supabase
      .from("collection_tweets")
      .delete()
      .eq("collection_id", collectionId)
      .eq("tweet_id", tweetId);
    loadCollection();
  }

  async function saveEdit() {
    if (!collection) return;
    await supabase
      .from("collections")
      .update({
        name: editName,
        slug: generateSlug(editName),
        description: editDescription || null,
        emoji: editEmoji || null,
      })
      .eq("id", collection.id);
    setEditing(false);
    loadCollection();
  }

  // Drag and drop handlers
  const handleDragStart = useCallback((index: number) => {
    dragItem.current = index;
    setDraggingIndex(index);
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragOverItem.current = index;
    if (dragItem.current === null || dragItem.current === index) return;

    setTweets((prev) => {
      const updated = [...prev];
      const draggedItem = updated[dragItem.current!];
      updated.splice(dragItem.current!, 1);
      updated.splice(index, 0, draggedItem);
      dragItem.current = index;
      return updated;
    });
  }, []);

  const handleDragEnd = useCallback(async () => {
    setDraggingIndex(null);
    dragItem.current = null;
    dragOverItem.current = null;

    // Persist new positions to DB
    const updates = tweets.map((tweet, index) =>
      supabase
        .from("collection_tweets")
        .update({ position: index })
        .eq("collection_id", collectionId)
        .eq("tweet_id", tweet.id)
    );
    await Promise.all(updates);
  }, [tweets, collectionId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-5">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Curio
        </Link>
        <div className="flex items-center gap-3">
          {allCollections.length > 0 && (
            <CollectionDropdown
              collections={allCollections}
              currentId={collectionId}
              username={username || ""}
              hrefPattern="dashboard"
            />
          )}
          {username && collection && (
            <ShareButton
              url={`${typeof window !== "undefined" ? window.location.origin : ""}/${username}/${collection.slug || collection.id}`}
              text={`Check out my "${collection.name}" collection on Curio!`}
            />
          )}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#F4F4F5] px-4 py-2 rounded-full text-sm font-medium text-black hover:bg-[#E4E4E7] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back to collections
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8">
        {/* Collection header */}
        {editing ? (
          <div className="bg-[#F4F4F5] rounded-[24px] p-8 mb-8">
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={editEmoji}
                onChange={(e) => setEditEmoji(e.target.value)}
                placeholder="Emoji"
                className="w-20 px-4 py-3 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
                maxLength={2}
              />
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
              />
            </div>
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-black/20 bg-white"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 text-sm text-[var(--text-muted)] hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-5 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-normal tracking-tight uppercase flex items-center gap-3">
                <span>{collection.emoji || "\u{1F4C1}"}</span>
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-[var(--text-muted)] mt-2">{collection.description}</p>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-[var(--text-muted)] hover:text-black transition-colors"
            >
              Edit
            </button>
          </div>
        )}

        {/* Add tweet form */}
        <form onSubmit={addTweet} className="mb-8">
          <div className="flex gap-3">
            <input
              type="url"
              placeholder="Paste your tweet's URL here"
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
              required
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap transition-colors"
            >
              {adding ? "Adding..." : "Add Tweet"}
            </button>
          </div>
          {addError && <p className="text-red-500 text-sm mt-2">{addError}</p>}
        </form>

        {/* Tweets list */}
        {tweets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">{"\u{1F4CC}"}</p>
            <p className="text-[var(--text-muted)] mb-2">No tweets yet</p>
            <p className="text-sm text-[var(--text-light)]">
              Paste a tweet URL above to add your first tweet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tweets.map((tweet, index) => (
              <div
                key={tweet.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={handleDragEnd}
                className={`cursor-grab active:cursor-grabbing transition-opacity ${
                  draggingIndex === index ? "opacity-50" : ""
                }`}
              >
                <TweetCard
                  tweet={tweet}
                  showRemove
                  onRemove={() => removeTweet(tweet.id)}
                  colorIndex={index}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
