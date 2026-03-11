"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CollectionItem {
  id: string;
  name: string;
  emoji: string | null;
  slug?: string;
}

interface CollectionDropdownProps {
  collections: CollectionItem[];
  currentId: string;
  username: string;
  /** Override the URL pattern. Defaults to "/{username}/{id}" (public). Use "/dashboard/collections/{id}" for dashboard. */
  hrefPattern?: "public" | "dashboard";
}

export default function CollectionDropdown({ collections, currentId, username, hrefPattern = "public" }: CollectionDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const current = collections.find((c) => c.id === currentId);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function getHref(col: CollectionItem) {
    if (hrefPattern === "dashboard") return `/dashboard/collections/${col.id}`;
    return `/${username}/${col.slug || col.id}`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 bg-[#F4F4F5] px-4 py-2 rounded-full text-sm font-medium text-black hover:bg-[#E4E4E7] transition-colors"
      >
        <span>{current?.emoji || "\u{1F4C1}"}</span>
        <span>{current?.name || "Collections"}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 min-w-[220px] z-50">
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => {
                setOpen(false);
                router.push(getHref(col));
              }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-[#F4F4F5] transition-colors ${
                col.id === currentId ? "font-semibold" : "text-black/70"
              }`}
            >
              <span>{col.emoji || "\u{1F4C1}"}</span>
              {col.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
