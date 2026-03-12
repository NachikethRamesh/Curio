"use client";

import { useEffect, useState, useCallback } from "react";
import { Tweet } from "@/types";
import TweetCard from "@/components/TweetCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { extractTweetId } from "@/lib/utils";
import Footer from "@/components/Footer";

const TRIAL_STORAGE_KEY = "curio_trial";
const MAX_FREE_TWEETS = 3;
const COLLECTION_NAME = "Design Tips";

interface TrialData {
  collectionName: string;
  tweets: Tweet[];
}

function getTrialData(): TrialData {
  if (typeof window === "undefined") {
    return { collectionName: COLLECTION_NAME, tweets: [] };
  }
  try {
    const raw = localStorage.getItem(TRIAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        collectionName: parsed.collectionName || COLLECTION_NAME,
        tweets: parsed.tweets || [],
      };
    }
  } catch {
    // ignore
  }
  return { collectionName: COLLECTION_NAME, tweets: [] };
}

function saveTrialData(data: TrialData) {
  localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(data));
}

export default function TryPage() {
  const router = useRouter();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tweetUrl, setTweetUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupReason, setSignupReason] = useState("");

  useEffect(() => {
    const data = getTrialData();
    setTweets(data.tweets);
  }, []);

  const promptSignup = useCallback((reason: string) => {
    setSignupReason(reason);
    setShowSignupPrompt(true);
  }, []);

  async function addTweet(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);

    // Check limit before adding
    if (tweets.length >= MAX_FREE_TWEETS) {
      promptSignup("You've reached the free limit of 3 tweets. Sign up to save unlimited tweets!");
      return;
    }

    // Check for duplicate
    const tweetId = extractTweetId(tweetUrl);
    if (!tweetId) {
      setAddError("Invalid tweet URL");
      return;
    }
    if (tweets.some((t) => t.id === tweetId)) {
      setAddError("This tweet is already in your collection");
      return;
    }

    setAdding(true);

    try {
      const res = await fetch("/api/tweets/fetch-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tweetUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddError(data.error);
        setAdding(false);
        return;
      }

      const newTweets = [...tweets, data.tweet];
      setTweets(newTweets);
      saveTrialData({ collectionName: COLLECTION_NAME, tweets: newTweets });
      setTweetUrl("");
    } catch {
      setAddError("Failed to fetch tweet. Please try again.");
    }

    setAdding(false);
  }

  function removeTweet(tweetId: string) {
    const newTweets = tweets.filter((t) => t.id !== tweetId);
    setTweets(newTweets);
    saveTrialData({ collectionName: COLLECTION_NAME, tweets: newTweets });
  }

  function handleShare() {
    promptSignup("Sign up to share your collection with a unique link!");
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Signup prompt modal */}
      {showSignupPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-[0_24px_48px_rgba(0,0,0,0.12)] text-center">
            <div className="w-14 h-14 mx-auto mb-5 bg-[var(--bg-base)] rounded-full flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h3
              className="text-[1.5rem] mb-2 tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
            >
              Create your free account
            </h3>
            <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed">
              {signupReason}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/signup"
                className="px-6 py-3 bg-[var(--text-main)] text-white rounded-full text-sm font-semibold shadow-[0_8px_16px_rgba(42,40,38,0.1)] hover:-translate-y-0.5 transition-all text-center"
              >
                Sign up free
              </Link>
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="px-6 py-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                Maybe later
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--text-main)] font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      )}

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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-pill)]">
            <span className="text-sm">📂</span>
            <span className="text-sm font-medium">{COLLECTION_NAME}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[0.85rem] font-medium bg-white/80 border border-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:bg-white hover:-translate-y-0.5 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>
          <Link
            href="/signup"
            className="px-4 sm:px-5 py-2 text-[0.8rem] sm:text-[0.85rem] font-medium bg-[var(--text-main)] text-white rounded-full shadow-[0_8px_16px_rgba(42,40,38,0.15)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(42,40,38,0.2)] transition-all"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-[100px] sm:pt-[160px]">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white rounded-[14px] flex items-center justify-center shadow-[var(--shadow-soft)] text-[var(--text-muted)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
              </svg>
            </div>
            <h1
              className="text-[2rem] sm:text-[3rem] lg:text-[3.5rem] italic font-normal tracking-[-0.02em] leading-none"
              style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
            >
              {COLLECTION_NAME}
            </h1>
          </div>

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

          {/* Tweet count / limit indicator */}
          <p className="text-xs text-[var(--text-muted)] mt-3 pl-6">
            {tweets.length} / {MAX_FREE_TWEETS} tweets &middot;{" "}
            <Link href="/signup" className="text-[var(--text-main)] font-semibold hover:underline">
              Sign up
            </Link>{" "}
            for unlimited
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tweets.map((tweet, index) => (
              <div key={tweet.id} className="relative">
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
      <Footer />
    </div>
  );
}
