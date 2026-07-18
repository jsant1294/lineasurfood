"use client";

import React from "react";
import { THEMES, themeToCssVars } from "@/data/themes";

export default function ThemeRoot({
  themeId,
  children,
  className,
  style,
}: {
  themeId: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const theme = THEMES[themeId] ?? THEMES.rojo;
  const vars = themeToCssVars(theme) as React.CSSProperties;
  return (
    <div
      className={className}
      style={{
        ...vars,
        background: [
          "radial-gradient(ellipse 80% 55% at 15% 0%,   color-mix(in srgb, var(--primary) 18%, transparent), transparent 70%)",
          "radial-gradient(ellipse 65% 50% at 85% 100%, color-mix(in srgb, var(--accent)  13%, transparent), transparent 70%)",
          "var(--bg)",
        ].join(", "),
        color: "var(--text)",
        minHeight: "100vh",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
