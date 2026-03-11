"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { normalizeHandle } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanedHandle = normalizeHandle(xHandle);
    if (!cleanedHandle || cleanedHandle.length < 1) {
      setError("Please enter your X handle");
      setLoading(false);
      return;
    }

    // X handles: 1-15 chars, letters, numbers, underscores
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanedHandle)) {
      setError("Invalid X handle");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Check if handle already registered
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", cleanedHandle)
      .single();

    if (existingUser) {
      setError("This X handle is already registered on Curio");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username: cleanedHandle,
        display_name: cleanedHandle,
        x_handle: cleanedHandle,
      });

      if (profileError) {
        setError(`Failed to create profile: ${profileError.message}`);
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-xl font-bold tracking-tight mb-10">
        Curio
      </Link>
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold mb-8 text-center tracking-tight">Create your account</h1>
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black/20 focus-within:border-transparent">
              <span className="pl-4 text-sm text-[var(--text-light)]">@</span>
              <input
                type="text"
                placeholder="your X handle"
                value={xHandle}
                onChange={(e) => setXHandle(e.target.value)}
                required
                className="flex-1 px-1 py-3 text-sm focus:outline-none"
              />
            </div>
            <p className="text-xs text-[var(--text-light)] mt-1.5">
              Your X handle will be your Curio username (curio.app/{cleanHandle(xHandle)})
            </p>
          </div>
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
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="text-sm text-[var(--text-muted)] text-center mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function cleanHandle(handle: string): string {
  return handle.replace(/^@/, "").trim().toLowerCase() || "handle";
}
