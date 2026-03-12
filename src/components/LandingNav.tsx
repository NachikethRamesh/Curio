"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

export default function LandingNav() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });
  }, []);

  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-[1200px] z-50 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/90 bg-white/70 backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
      <Link href="/" className="flex items-center gap-1.5">
        <Image src="/logo-sm.png" alt="Curio" width={56} height={56} className="w-14 h-14 object-contain" />
        <span
          className="text-[1.2rem] sm:text-[1.4rem] font-medium italic tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
        >
          Curio.
        </span>
      </Link>
      <div className="flex gap-3 sm:gap-6 items-center">
        <Link
          href="/#how-it-works"
          className="text-[0.9rem] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors hidden sm:block"
        >
          How it works
        </Link>
        <Link
          href="/#why-curio"
          className="text-[0.9rem] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors hidden sm:block"
        >
          Why Curio
        </Link>
        <Link
          href="/#features"
          className="text-[0.9rem] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors hidden sm:block"
        >
          Features
        </Link>
        {loggedIn ? (
          <Link
            href="/dashboard"
            className="px-5 py-2 text-[0.85rem] font-medium bg-[var(--text-main)] text-white rounded-full shadow-[0_8px_16px_rgba(42,40,38,0.15)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(42,40,38,0.2)] transition-all"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 sm:px-5 py-2 text-[0.8rem] sm:text-[0.85rem] font-medium bg-[var(--text-main)] text-white rounded-full shadow-[0_8px_16px_rgba(42,40,38,0.15)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(42,40,38,0.2)] transition-all"
            >
              Log in
            </Link>
            <Link
              href="/try"
              className="px-4 sm:px-5 py-2 text-[0.8rem] sm:text-[0.85rem] font-medium bg-[var(--text-main)] text-white rounded-full shadow-[0_8px_16px_rgba(42,40,38,0.15)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(42,40,38,0.2)] transition-all"
            >
              Try it now!
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
