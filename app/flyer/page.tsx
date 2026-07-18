"use client";

import { useStore } from "@/lib/store";
import QRCanvas from "@/components/QRCanvas";
import { THEMES } from "@/data/themes";
import { t } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";

export default function FlyerPage() {
  const { business, lang, hydrated } = useStore();
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const theme = THEMES[business.theme] ?? THEMES.rojo;

  if (!hydrated) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: "#e9e9ec" }}>
        <div className="h-10 w-10 rounded-full border-2 animate-spin"
          style={{ borderColor: "#ccc", borderTopColor: "#888" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 grid place-items-center" style={{ background: "#e9e9ec" }}>
      <style>{`@media print { .no-print { display:none !important; } @page { margin: 0; } body { background:#fff; } }`}</style>

      <button onClick={() => window.print()}
        className="no-print fixed top-5 right-5 z-10 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2"
        style={{ background: theme.primary, color: theme.primaryText }}>
        <Printer size={18} /> Print
      </button>

      {/* 8.5 x 11 ratio flyer */}
      <div
        className="w-full max-w-[612px] aspect-[8.5/11] shadow-2xl flex flex-col items-center justify-between p-12 text-center"
        style={{ background: theme.bg, color: theme.text, fontFamily: theme.font }}
      >
        <div className="flex flex-col items-center gap-3">
          {business.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logo} alt="" className="h-24 w-24 rounded-3xl object-cover" />
          ) : (
            <div className="h-24 w-24 rounded-3xl grid place-items-center text-4xl font-black"
              style={{ background: theme.primary, color: theme.primaryText }}>
              {business.businessName.slice(0, 1)}
            </div>
          )}
          <h1 className="text-4xl font-black leading-tight">{business.businessName}</h1>
          <p className="text-lg" style={{ color: theme.textMuted }}>{business.tagline}</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl" style={{ background: "#fff" }}>
            <QRCanvas value={origin || "https://"} size={200} dark={theme.bg} />
          </div>
          <p className="text-2xl font-black" style={{ color: theme.accent }}>{t("scanToOrder", lang)}</p>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-xl font-extrabold">{business.phoneNumber}</p>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {business.serviceAreas.join(" · ")}
          </p>
          <p className="text-xs mt-3" style={{ color: theme.textMuted }}>
            {lang === "es" ? "Ordena por WhatsApp" : "Order on WhatsApp"} · LíneaSur Menu Express
          </p>
        </div>
      </div>
    </div>
  );
}
