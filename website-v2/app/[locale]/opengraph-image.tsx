import { ImageResponse } from "next/og";

export const alt = "Zongii — Plumbing, Building & Mining Supplies";
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
      ? "Vifaa vya Mabomba, Ujenzi na Madini"
      : "Plumbing, Building & Mining Supplies";

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
          background: "#0d2b49",
          color: "#f6f8fa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 40, letterSpacing: 8 }}>ZONGII</div>
          <div
            style={{
              width: 10,
              height: 10,
              background: "#d9a441",
              transform: "rotate(45deg)",
            }}
          />
          <div style={{ fontSize: 20, letterSpacing: 4, color: "#6fa8d6" }}>
            MWANZA · EST. 2002
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              width: 96,
              height: 2,
              background: "#d9a441",
            }}
          />
          <div style={{ fontSize: 72, lineHeight: 1.08, maxWidth: 950 }}>
            {tagline}
          </div>
          <div style={{ fontSize: 28, color: "#6fa8d6", letterSpacing: 3 }}>
            TANZANIA · SINCE 2002
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#87a0b8",
            letterSpacing: 2,
          }}
        >
          <div>PAMBA ROAD · MWANZA · TANZANIA</div>
          <div>2°31′S 32°54′E</div>
        </div>
      </div>
    ),
    size,
  );
}
