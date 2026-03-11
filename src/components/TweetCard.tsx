"use client";

import { Tweet } from "@/types";
import { useEffect, useRef } from "react";

const CARD_TINTS = [
  "rgba(230, 245, 240, 0.6)", // mint
  "rgba(230, 240, 250, 0.6)", // sky
];

interface TweetCardProps {
  tweet: Tweet;
  onRemove?: () => void;
  showRemove?: boolean;
  colorIndex?: number;
}

type Twttr = {
  widgets: {
    createTweet: (id: string, el: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLElement | undefined>;
  };
  ready: (fn: () => void) => void;
};

function getTwttr(): Twttr | undefined {
  return (window as unknown as { twttr?: Twttr }).twttr;
}

function ensureScript(): Promise<Twttr> {
  return new Promise((resolve) => {
    const existing = getTwttr();
    if (existing?.widgets) {
      resolve(existing);
      return;
    }

    const scriptExists = document.querySelector(
      'script[src="https://platform.twitter.com/widgets.js"]'
    );

    if (!scriptExists) {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const interval = setInterval(() => {
      const t = getTwttr();
      if (t?.widgets) {
        clearInterval(interval);
        resolve(t);
      }
    }, 100);
  });
}

function getTweetIdFromUrl(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

export default function TweetCard({ tweet, onRemove, showRemove, colorIndex = 0 }: TweetCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bgColor = CARD_TINTS[colorIndex % CARD_TINTS.length];

  useEffect(() => {
    if (!wrapperRef.current) return;

    const tweetId = getTweetIdFromUrl(tweet.tweet_url);
    if (!tweetId) return;

    const widgetContainer = document.createElement("div");
    wrapperRef.current.appendChild(widgetContainer);

    let cancelled = false;

    ensureScript().then((twttr) => {
      if (cancelled) {
        widgetContainer.remove();
        return;
      }
      twttr.widgets.createTweet(tweetId, widgetContainer, { conversation: "none" });
    });

    return () => {
      cancelled = true;
      widgetContainer.remove();
    };
  }, [tweet.tweet_url]);

  return (
    <div
      className="relative group rounded-[20px] overflow-hidden h-[360px] sm:h-[400px] lg:h-[420px] backdrop-blur-[24px] border border-white/90 shadow-[0_24px_48px_rgba(42,40,38,0.04),0_8px_16px_rgba(42,40,38,0.02)] hover:-translate-y-1 transition-transform duration-300"
      style={{ backgroundColor: bgColor }}
    >
      {showRemove && onRemove && (
        <button
          onClick={onRemove}
          className="absolute bottom-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-red-500"
          title="Remove from collection"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
      <div
        ref={wrapperRef}
        className="h-full overflow-y-auto flex items-start justify-center p-3 sm:p-4 [&_twitter-widget]:!m-0 [&_twitter-widget]:!max-w-none [&_twitter-widget]:scale-[1.1] sm:[&_twitter-widget]:scale-[1.2] [&_twitter-widget]:origin-top"
      />
    </div>
  );
}
