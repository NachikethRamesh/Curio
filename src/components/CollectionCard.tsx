import Link from "next/link";
import { Collection } from "@/types";

const PASTEL_COLORS = [
  "bg-[#DCFBC7]",
  "bg-[#CEF3FD]",
  "bg-[#DFEDFD]",
  "bg-[#FEF6D0]",
  "bg-[#EFE7FD]",
  "bg-[#FDDADA]",
];

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
  index = 0,
}: CollectionCardProps) {
  const colorClass = PASTEL_COLORS[index % PASTEL_COLORS.length];

  return (
    <div className={`${colorClass} rounded-[24px] p-8 hover:scale-[1.02] transition-transform group relative`}>
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-black/30 hover:text-red-500 text-lg"
          title="Delete collection"
        >
          &times;
        </button>
      )}
      <Link href={href} className="block">
        <div className="text-3xl mb-3">{collection.emoji || "\u{1F4C1}"}</div>
        <h3 className="font-semibold text-lg mb-1">{collection.name}</h3>
        {collection.description && (
          <p className="text-sm text-black/50 mb-3 line-clamp-2">
            {collection.description}
          </p>
        )}
        <p className="text-xs font-medium text-black/40 uppercase tracking-wider">
          {tweetCount !== undefined ? `${tweetCount} tweet${tweetCount !== 1 ? "s" : ""}` : ""}
        </p>
      </Link>
    </div>
  );
}
