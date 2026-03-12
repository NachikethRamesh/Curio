"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase automatically picks up the recovery token from the URL hash
    // and establishes a session. We need to wait for that to happen.
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // Also check if there's already an active session (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        // Give the auth state change listener a moment to fire
        setTimeout(() => {
          setSessionReady((prev) => {
            if (!prev) setSessionError(true);
            return prev;
          });
        }, 3000);
      }
    });
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.replace("/dashboard");
      }, 2000);
    }
  }

  if (sessionError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5">
        <Link href="/" className="text-xl font-bold tracking-tight mb-10">
          Curio
        </Link>
        <div className="w-full max-w-sm text-center">
          <h1 className="text-3xl font-semibold mb-4 tracking-tight">Invalid or expired link</h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">
            This password reset link is no longer valid. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <Link href="/" className="text-xl font-bold tracking-tight mb-10">
        Curio
      </Link>
      <div className="w-full max-w-sm">
        {success ? (
          <div className="text-center">
            <h1 className="text-3xl font-semibold mb-4 tracking-tight">Password updated</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Your password has been reset. Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-semibold mb-3 text-center tracking-tight">Set new password</h1>
            <p className="text-sm text-[var(--text-muted)] text-center mb-8">
              Enter your new password below.
            </p>
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
