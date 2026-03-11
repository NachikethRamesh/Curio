"use client";

import { Tweet } from "@/types";
import { useEffect, useRef } from "react";

const PASTEL_COLORS = [
  "#DCFBC7", // lime
  "#CEF3FD", // cyan
  "#DFEDFD", // peri
  "#FEF6D0", // lemon
  "#EFE7FD", // lavender
  "#FDDADA", // blush
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
  const bgColor = PASTEL_COLORS[colorIndex % PASTEL_COLORS.length];

  useEffect(() => {
    if (!wrapperRef.current) return;

    const tweetId = getTweetIdFromUrl(tweet.tweet_url);
    if (!tweetId) return;

    // Create a standalone div outside React's control
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
      className="relative group rounded-[24px] overflow-hidden h-[420px]"
      style={{ backgroundColor: bgColor }}
    >
      {showRemove && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 text-red-500 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
          title="Remove from collection"
        >
          &times;
        </button>
      )}
      <div
        ref={wrapperRef}
        className="h-full overflow-y-auto flex items-start justify-center p-4 [&_twitter-widget]:!m-0"
      />
    </div>
  );
}
