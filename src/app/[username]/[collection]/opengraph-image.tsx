import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Curio Collection";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string; collection: string }>;
}) {
  const { username, collection: collectionSlug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("username", username)
    .single();

  if (!profile) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fcfaf8", fontSize: "32px", color: "#787470" }}>
          Not Found
        </div>
      ),
      { ...size }
    );
  }

  let { data: collection } = await supabase
    .from("collections")
    .select("name, description")
    .eq("slug", collectionSlug)
    .eq("user_id", profile.id)
    .single();

  if (!collection) {
    const { data: colById } = await supabase
      .from("collections")
      .select("name, description")
      .eq("id", collectionSlug)
      .eq("user_id", profile.id)
      .single();
    collection = colById;
  }

  const collectionName = collection?.name || "Collection";
  const description = collection?.description || "";

  // Get tweet count
  const { count } = await supabase
    .from("collection_tweets")
    .select("*", { count: "exact", head: true })
    .eq("collection_id", collectionSlug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #fcfaf8 0%, #f5f0eb 50%, #f0eae3 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ fontSize: "28px", fontWeight: 500, fontStyle: "italic", color: "#2A2826" }}>
            Curio.
          </div>
          <div style={{ fontSize: "16px", color: "#787470", background: "#F2EFEA", padding: "6px 16px", borderRadius: "100px", fontWeight: 500 }}>
            Collection
          </div>
        </div>

        <div style={{ fontSize: "64px", fontWeight: 500, fontStyle: "italic", color: "#2A2826", lineHeight: 1.1, marginBottom: "16px" }}>
          {collectionName}
        </div>

        <div style={{ fontSize: "24px", color: "#787470", marginBottom: "20px" }}>
          by @{username} {count ? `· ${count} tweets` : ""}
        </div>

        {description && (
          <div style={{ fontSize: "22px", color: "#787470", lineHeight: 1.5, maxWidth: "800px" }}>
            {description.length > 140 ? description.slice(0, 140) + "..." : description}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
