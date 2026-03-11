"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LandingNav() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 sm:px-10 py-5 w-full">
      <span className="text-xl font-bold tracking-tight">Curio</span>
      <div className="flex gap-3 items-center">
        {loggedIn ? (
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-sm font-semibold bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-black transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 text-sm font-semibold bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Sign up free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
