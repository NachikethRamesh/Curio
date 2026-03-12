"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <Link href="/" className="text-xl font-bold tracking-tight mb-10">
        Curio
      </Link>
      <div className="w-full max-w-sm">
        {sent ? (
          <div className="text-center">
            <h1 className="text-3xl font-semibold mb-4 tracking-tight">Check your email</h1>
            <p className="text-sm text-[var(--text-muted)] mb-8">
              We sent a password reset link to <strong className="text-[var(--text-main)]">{email}</strong>. Click the link in the email to reset your password.
            </p>
            <Link
              href="/login"
              className="text-sm text-black font-semibold hover:underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-semibold mb-3 text-center tracking-tight">Reset your password</h1>
            <p className="text-sm text-[var(--text-muted)] text-center mb-8">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <p className="text-sm text-[var(--text-muted)] text-center mt-8">
              Remember your password?{" "}
              <Link href="/login" className="text-black font-semibold hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
