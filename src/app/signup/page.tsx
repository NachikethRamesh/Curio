"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { normalizeHandle, generateSlug } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TRIAL_STORAGE_KEY = "curio_trial";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function migrateTrialData(supabase: ReturnType<typeof createClient>, userId: string) {
    try {
      const raw = localStorage.getItem(TRIAL_STORAGE_KEY);
      if (!raw) return null;

      const trialData = JSON.parse(raw);
      const tweets = trialData.tweets;
      if (!tweets || tweets.length === 0) return null;

      const collectionName = trialData.collectionName || "Design Tips";

      // Create the collection
      const { data: collection, error: colError } = await supabase
        .from("collections")
        .insert({
          user_id: userId,
          name: collectionName,
          slug: generateSlug(collectionName),
          emoji: "📂",
          position: 0,
          is_public: true,
        })
        .select()
        .single();

      if (colError || !collection) return null;

      // Insert tweets and link them
      for (let i = 0; i < tweets.length; i++) {
        const tweet = tweets[i];

        // Upsert tweet (may already exist from another user)
        await supabase
          .from("tweets")
          .upsert({
            id: tweet.id,
            author_handle: tweet.author_handle,
            author_name: tweet.author_name,
            embed_html: tweet.embed_html,
            tweet_url: tweet.tweet_url,
          }, { onConflict: "id" });

        // Link to collection
        await supabase.from("collection_tweets").insert({
          collection_id: collection.id,
          tweet_id: tweet.id,
          position: i,
        });
      }

      // Clear trial data
      localStorage.removeItem(TRIAL_STORAGE_KEY);

      return collection.id;
    } catch {
      return null;
    }
  }

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

      // Migrate trial data if any
      const collectionId = await migrateTrialData(supabase, data.user.id);

      if (collectionId) {
        router.replace(`/dashboard/collections/${collectionId}`);
      } else {
        router.replace("/dashboard");
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
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
              Your profile will live at curio-brown.vercel.app/{cleanHandle(xHandle)}
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
