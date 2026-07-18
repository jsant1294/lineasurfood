"use client";

import { useStore } from "@/lib/store";

export default function LanguageToggle() {
  const { lang, setLang } = useStore();
  return (
    <div
      className="inline-flex rounded-full p-0.5 text-sm font-bold select-none"
      style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}
    >
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="px-3 py-1 rounded-full transition-colors"
          style={
            lang === l
              ? { background: "var(--primary)", color: "var(--primary-text)" }
              : { color: "var(--text-muted)" }
          }
          aria-pressed={lang === l}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
