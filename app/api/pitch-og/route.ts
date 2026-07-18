import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0F0B08",
          display: "flex",
          flexDirection: "column",
          padding: "60px 72px 48px",
        }}
      >
        {/* Top accent bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 44 }}>
          <div style={{ width: 48, height: 4, background: "#E04A18" }} />
          <span style={{ color: "#E04A18", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>
            LíneaSur Menu Express
          </span>
        </div>

        {/* Main body */}
        <div style={{ display: "flex", flex: 1, gap: 56, alignItems: "flex-start" }}>

          {/* Left: big headline */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", fontSize: 86, fontWeight: 900, color: "#F0EBE0", lineHeight: 0.9, letterSpacing: "-0.02em" }}>
              Your Menu.
            </div>
            <div style={{ display: "flex", fontSize: 86, fontWeight: 900, color: "#E04A18", lineHeight: 0.9, letterSpacing: "-0.02em", fontStyle: "italic" }}>
              Online.
            </div>
            <div style={{ display: "flex", fontSize: 86, fontWeight: 900, color: "#F0EBE0", lineHeight: 0.9, letterSpacing: "-0.02em" }}>
              Tonight.
            </div>
            <div style={{ display: "flex", marginTop: 28, fontSize: 18, color: "#9A8878", lineHeight: 1.5, maxWidth: 480 }}>
              A complete WhatsApp-native ordering system for food businesses. Bilingual. No app needed.
            </div>
          </div>

          {/* Right: feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 272, paddingTop: 8 }}>
            {[
              "WhatsApp-native ordering",
              "Bilingual ES / EN",
              "Item modifiers & add-ons",
              "Daily order log",
              "QR code & print flyer",
              "Any device, no download",
            ].map((feat) => (
              <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 11,
                  background: "#1C160F", border: "1.5px solid #E04A18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#E04A18", fontSize: 12, fontWeight: 900, flexShrink: 0,
                }}>
                  ✓
                </div>
                <span style={{ color: "#B0A090", fontSize: 15, fontWeight: 500 }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 36, paddingTop: 18,
          borderTop: "1px solid #2A221A",
        }}>
          <span style={{ color: "#F0EBE0", fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
            lineasur-menu.vercel.app/pitch.html
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#4CAF50" }} />
            <span style={{ color: "#7A6A5A", fontSize: 13 }}>Live demo available</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
