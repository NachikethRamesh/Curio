import Link from "next/link";
import { Collection } from "@/types";

interface CollectionCardProps {
  collection: Collection;
  tweetCount?: number;
  href: string;
  onDelete?: () => void;
  index?: number;
}

export default function CollectionCard({
  collection,
  tweetCount,
  href,
  onDelete,
}: CollectionCardProps) {
  return (
    <div className="relative group">
      <Link
        href={href}
        className="block bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-8 border border-black/[0.03] shadow-[0_12px_32px_rgba(42,40,38,0.04),0_4px_8px_rgba(42,40,38,0.02)] hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(42,40,38,0.06),0_8px_16px_rgba(42,40,38,0.03)] hover:border-black/[0.06] transition-all duration-400 min-h-[180px] sm:min-h-[240px] flex flex-col justify-between"
        style={{ transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}
      >
        <div>
          <h3
            className="text-[1.4rem] sm:text-[1.8rem] italic font-normal leading-[1.2] mb-2 pr-8"
            style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
          >
            {collection.name}
          </h3>
          <span className="uppercase tracking-[0.1em] text-xs font-semibold text-[var(--text-muted)]">
            {tweetCount !== undefined
              ? `${tweetCount} tweet${tweetCount !== 1 ? "s" : ""}`
              : ""}
          </span>
        </div>
        {collection.description && (
          <p className="text-sm text-[var(--text-muted)] mt-4 line-clamp-2">
            {collection.description}
          </p>
        )}
      </Link>
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-red-500"
          title="Delete collection"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
}
