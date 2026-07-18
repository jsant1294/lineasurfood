"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRCanvas({
  value,
  size = 220,
  dark = "#000000",
  light = "#ffffff",
}: {
  value: string;
  size?: number;
  dark?: string;
  light?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) {
      QRCode.toCanvas(ref.current, value || " ", {
        width: size,
        margin: 1,
        color: { dark, light },
      }).catch(() => {});
    }
  }, [value, size, dark, light]);
  return <canvas ref={ref} className="rounded-xl" style={{ width: size, height: size }} />;
}
