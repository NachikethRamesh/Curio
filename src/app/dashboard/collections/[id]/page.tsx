"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Collection, Tweet } from "@/types";
import { generateSlug } from "@/lib/utils";
import TweetCard from "@/components/TweetCard";
import ShareButton from "@/components/ShareButton";
import CollectionDropdown from "@/components/CollectionDropdown";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTweetCard({
  tweet,
  index,
  onRemove,
}: {
  tweet: Tweet;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tweet.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0 left-0 right-0 z-20 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing rounded-t-[20px] bg-black/0 hover:bg-black/[0.03] transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#d1c9c4]">
          <circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/>
          <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
          <circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>
        </svg>
      </div>
      <TweetCard tweet={tweet} showRemove onRemove={onRemove} colorIndex={index} />
    </div>
  );
}

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    loadCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  async function loadCollection() {
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    if (profile) setUsername(profile.username);

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

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = tweets.findIndex((t) => t.id === active.id);
      const newIndex = tweets.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = [...tweets];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      setTweets(reordered);

      const updates = reordered.map((tweet, index) =>
        supabase
          .from("collection_tweets")
          .update({ position: index })
          .eq("collection_id", collectionId)
          .eq("tweet_id", tweet.id)
      );
      await Promise.all(updates);
    },
    [tweets, collectionId, supabase]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="min-h-screen pb-24">
      {/* Nav */}
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-[1200px] z-50 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/90 bg-white/70 backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-1.5">
            <img src="/logo-sm.png" alt="" className="w-14 h-14 object-contain" />
            <span
              className="text-[1.2rem] sm:text-[1.4rem] font-medium italic tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
            >
              Curio.
            </span>
          </Link>
          {allCollections.length > 0 && (
            <CollectionDropdown
              collections={allCollections}
              currentId={collectionId}
              username={username || ""}
              hrefPattern="dashboard"
            />
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard"
            className="text-[0.8rem] sm:text-[0.9rem] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors hidden sm:block"
          >
            Back to collections
          </Link>
          <Link
            href="/dashboard"
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors sm:hidden"
            title="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </Link>
          {username && collection && (
            <ShareButton
              url={`${typeof window !== "undefined" ? window.location.origin : ""}/${username}/${collection.slug || collection.id}`}
              text={`Check out my "${collection.name}" collection on Curio!`}
            />
          )}
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-[100px] sm:pt-[160px]">
        {/* Header */}
        <header className="mb-12">
          {editing ? (
            <div className="bg-white rounded-[24px] p-8 border border-white/90 shadow-[var(--shadow-soft)]">
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={editEmoji}
                  onChange={(e) => setEditEmoji(e.target.value)}
                  placeholder="Emoji"
                  className="w-20 px-4 py-3 border border-black/10 rounded-[12px] text-sm text-center focus:outline-none focus:ring-2 focus:ring-black/10 bg-[var(--bg-base)]"
                  maxLength={2}
                />
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-4 py-3 border border-black/10 rounded-[12px] text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-[var(--bg-base)]"
                />
              </div>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description"
                className="w-full px-4 py-3 border border-black/10 rounded-[12px] text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-black/10 bg-[var(--bg-base)]"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditing(false)}
                  className="px-5 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-6 py-2.5 bg-[var(--text-main)] text-white rounded-full text-sm font-semibold shadow-[0_8px_16px_rgba(42,40,38,0.1)] hover:-translate-y-0.5 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white rounded-[14px] flex items-center justify-center shadow-[var(--shadow-soft)] text-[var(--text-muted)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                </div>
                <h1
                  className="text-[2rem] sm:text-[3rem] lg:text-[3.5rem] italic font-normal tracking-[-0.02em] leading-none"
                  style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
                >
                  {collection.name}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  className="ml-auto text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                  Edit
                </button>
              </div>
              {collection.description && (
                <p className="text-[var(--text-muted)] mb-6">{collection.description}</p>
              )}
            </>
          )}

          {/* Add tweet input bar */}
          <form onSubmit={addTweet}>
            <div className="flex items-center bg-white py-2 pl-4 sm:pl-6 pr-2 rounded-full border border-white/90 shadow-[var(--shadow-soft)] gap-2 sm:gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b8b4b0" strokeWidth="2" className="shrink-0 hidden sm:block">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <input
                type="url"
                placeholder="Paste a tweet URL..."
                value={tweetUrl}
                onChange={(e) => setTweetUrl(e.target.value)}
                required
                className="flex-1 min-w-0 border-none outline-none text-sm sm:text-base bg-transparent placeholder:text-[#b8b4b0]"
              />
              <button
                type="submit"
                disabled={adding}
                className="px-4 sm:px-5 py-2 bg-[var(--text-main)] text-white rounded-full text-[0.8rem] sm:text-[0.85rem] font-medium disabled:opacity-50 whitespace-nowrap transition-all hover:-translate-y-0.5"
              >
                {adding ? "Adding..." : "Add"}
              </button>
            </div>
            {addError && <p className="text-red-500 text-sm mt-3 pl-6">{addError}</p>}
          </form>
        </header>

        {/* Tweets grid */}
        {tweets.length === 0 ? (
          <div className="py-20 px-10 text-center border-2 border-dashed border-black/[0.08] rounded-[20px] bg-white/20">
            <p className="text-4xl mb-4">{"\u{1F4CC}"}</p>
            <p className="text-[var(--text-muted)] mb-2">No tweets yet</p>
            <p className="text-sm text-[var(--text-muted)]">
              Paste a tweet URL above to add your first tweet
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tweets.map((t) => t.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tweets.map((tweet, index) => (
                  <SortableTweetCard
                    key={tweet.id}
                    tweet={tweet}
                    index={index}
                    onRemove={() => removeTweet(tweet.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      <Footer />
    </div>
  );
}
