import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Curio Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, bio, x_handle")
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

  const { data: collections } = await supabase
    .from("collections")
    .select("name")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("position", { ascending: true })
    .limit(6);

  const displayName = profile.display_name || username;
  const bio = profile.bio || "";
  const collectionNames = collections?.map((c) => c.name) || [];

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
            Profile
          </div>
        </div>

        <div style={{ fontSize: "64px", fontWeight: 600, color: "#2A2826", lineHeight: 1.1, marginBottom: "16px" }}>
          {displayName}
        </div>

        {profile.x_handle && (
          <div style={{ fontSize: "22px", color: "#787470", marginBottom: "20px" }}>
            @{profile.x_handle}
          </div>
        )}

        {bio && (
          <div style={{ fontSize: "22px", color: "#787470", lineHeight: 1.5, maxWidth: "800px", marginBottom: "32px" }}>
            {bio.length > 120 ? bio.slice(0, 120) + "..." : bio}
          </div>
        )}

        {collectionNames.length > 0 && (
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {collectionNames.map((name) => (
              <div
                key={name}
                style={{
                  background: "white",
                  padding: "10px 24px",
                  borderRadius: "100px",
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#2A2826",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
