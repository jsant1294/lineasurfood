import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { CartProvider } from "@/lib/cart";
import { getBusinessData, getMenuData } from "@/lib/data-store";

function siteUrl(): string {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return host ? `https://${host}` : "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  const business = await getBusinessData();
  return {
    metadataBase: new URL(siteUrl()),
    title: business.businessName,
    description: business.tagline,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: business.businessName,
    },
    icons: {
      apple: "/icon-192.svg",
    },
    openGraph: {
      title: business.businessName,
      description: business.tagline,
      type: "website",
      locale: business.languageDefault === "es" ? "es_US" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: business.businessName,
      description: business.tagline,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#1a0e0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [business, menu] = await Promise.all([getBusinessData(), getMenuData()]);

  return (
    <html lang="es">
      <body>
        <StoreProvider initialBusiness={business} initialMenu={menu}>
          <CartProvider>{children}</CartProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
