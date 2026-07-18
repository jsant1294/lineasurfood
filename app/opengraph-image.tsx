import { ImageResponse } from "next/og";
import { getBusinessData } from "@/lib/data-store";
import { THEMES } from "@/data/themes";

export const alt = "LíneaSur Menu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const business = await getBusinessData();
  const theme = THEMES[business.theme] ?? THEMES.rojo;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: theme.bg,
          color: theme.text,
        }}
      >
        {business.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.logo}
            width={160}
            height={160}
            style={{ borderRadius: 32, objectFit: "cover", marginBottom: 32 }}
          />
        ) : (
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 72,
              fontWeight: 900,
              background: theme.primary,
              color: theme.primaryText,
              marginBottom: 32,
            }}
          >
            {business.businessName.slice(0, 1)}
          </div>
        )}
        <div style={{ display: "flex", fontSize: 64, fontWeight: 900, textAlign: "center", padding: "0 60px" }}>
          {business.businessName}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: theme.textMuted,
            marginTop: 16,
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          {business.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
