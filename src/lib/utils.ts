/**
 * Extract tweet ID from various X/Twitter URL formats.
 * Supports:
 *   https://x.com/user/status/123456
 *   https://twitter.com/user/status/123456
 *   https://x.com/user/status/123456?s=20
 */
export function extractTweetId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname !== "x.com" &&
      parsed.hostname !== "twitter.com" &&
      parsed.hostname !== "www.x.com" &&
      parsed.hostname !== "www.twitter.com"
    ) {
      return null;
    }
    const match = parsed.pathname.match(/\/status\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Normalize an X handle for comparison.
 * Strips leading @, lowercases, trims whitespace.
 */
export function normalizeHandle(handle: string): string {
  return handle.replace(/^@/, "").trim().toLowerCase();
}

/**
 * Extract handle from an oEmbed author_url.
 * e.g. "https://twitter.com/nazzari" → "nazzari"
 */
export function extractHandleFromAuthorUrl(authorUrl: string): string | null {
  try {
    const url = new URL(authorUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0]?.toLowerCase() || null;
  } catch {
    return null;
  }
}

/**
 * Generate a URL-safe slug from a collection name.
 * "Hiring Advice" → "hiring_advice"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Fetch tweet embed HTML via X's free oEmbed API.
 * No authentication required.
 */
export async function fetchTweetOEmbed(tweetUrl: string): Promise<{
  html: string;
  author_name: string;
  author_url: string;
  url: string;
} | null> {
  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}&omit_script=true`;

  const res = await fetch(oembedUrl);
  if (!res.ok) return null;

  const data = await res.json();
  return {
    html: data.html,
    author_name: data.author_name,
    author_url: data.author_url,
    url: data.url,
  };
}
