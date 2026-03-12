"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.replace("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-[1200px] z-50 flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/90 bg-white/70 backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
        <Link href="/" className="flex items-center gap-1.5">
          <img src="/logo-sm.png" alt="" className="w-14 h-14 object-contain" />
          <span
            className="text-[1.2rem] sm:text-[1.4rem] font-medium italic tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-serif), 'Newsreader', serif" }}
          >
            Curio.
          </span>
        </Link>
      </nav>
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold mb-8 text-center tracking-tight">Welcome back</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent"
          />
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 bg-black text-white rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <Link
            href="/forgot-password"
            className="text-sm text-[var(--text-muted)] text-center hover:text-[var(--text-main)] transition-colors"
          >
            Forgot your password?
          </Link>
        </form>
        <p className="text-sm text-[var(--text-muted)] text-center mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-black font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
