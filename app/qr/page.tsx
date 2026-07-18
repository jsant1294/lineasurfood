"use client";

import { useStore } from "@/lib/store";
import ThemeRoot from "@/components/ThemeRoot";
import QRCanvas from "@/components/QRCanvas";
import { t } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export default function QRPage() {
  const { business, lang, hydrated } = useStore();
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const waClean = business.whatsappNumber.replace(/\D/g, "");

  if (!hydrated) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="h-10 w-10 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <ThemeRoot themeId={business.theme}>
      <div className="min-h-screen grid place-items-center p-6">
        <div className="card p-8 max-w-sm w-full text-center flex flex-col items-center gap-5">
          {business.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logo} alt={business.businessName} className="h-20 w-20 rounded-2xl object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-2xl grid place-items-center text-3xl font-black"
              style={{ background: "var(--primary)", color: "var(--primary-text)" }}>
              {business.businessName.slice(0, 1)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black brand-font">{business.businessName}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{business.tagline}</p>
          </div>

          <div className="p-3 rounded-2xl" style={{ background: "#fff" }}>
            <QRCanvas value={origin || "https://"} size={220} />
          </div>

          <p className="text-lg font-extrabold" style={{ color: "var(--accent)" }}>
            {t("scanToOrder", lang)}
          </p>

          <a href={`https://wa.me/${waClean}`} target="_blank" rel="noopener noreferrer"
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            style={{ background: "#25D366", color: "#fff" }}>
            <MessageCircle size={18} /> WhatsApp · {business.whatsappNumber}
          </a>
        </div>
      </div>
    </ThemeRoot>
  );
}
