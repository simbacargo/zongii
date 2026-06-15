import { ImageResponse } from "next/og";

export const alt = "Zongii — Mining, Building & Construction Supplies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tagline =
    locale === "sw"
      ? "Vifaa vya Madini, Ujenzi na Ukandarasi"
      : "Mining, Building & Construction Supplies";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(900px 600px at 10% -10%, #14324a, transparent), radial-gradient(700px 500px at 110% 20%, #3a2c12, transparent), #06121a",
          color: "#edf4f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              background: "#d4af6a",
              color: "#07131b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              fontWeight: 800,
            }}
          >
            Z
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: 8,
            }}
          >
            ZONGII
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
            {tagline}
          </div>
          <div style={{ fontSize: 30, color: "#d4af6a" }}>
            Tanzania · Since 2002
          </div>
        </div>

        <div style={{ fontSize: 26, color: "#7e94a0" }}>
          Pamba Road · Mwanza · Tanzania
        </div>
      </div>
    ),
    size,
  );
}
