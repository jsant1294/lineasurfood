"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Upload, X } from "lucide-react";

export default function ImageInput({
  value,
  onChange,
  label,
  aspect = "aspect-square",
  targetWidth,
  targetHeight,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  aspect?: string;
  /** Output canvas width in px. When paired with targetHeight, image is center-cropped to this ratio. */
  targetWidth?: number;
  /** Output canvas height in px. When paired with targetWidth, image is center-cropped to this ratio. */
  targetHeight?: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const srcW = img.naturalWidth;
        const srcH = img.naturalHeight;

        let outW: number;
        let outH: number;
        let sx: number;
        let sy: number;
        let sw: number;
        let sh: number;

        if (targetWidth && targetHeight) {
          // Center-crop to target aspect ratio, then resize to target dimensions.
          const targetRatio = targetWidth / targetHeight;
          const srcRatio = srcW / srcH;

          if (srcRatio > targetRatio) {
            // Source is wider — crop sides
            sh = srcH;
            sw = Math.round(srcH * targetRatio);
            sx = Math.round((srcW - sw) / 2);
            sy = 0;
          } else {
            // Source is taller — crop top/bottom
            sw = srcW;
            sh = Math.round(srcW / targetRatio);
            sx = 0;
            sy = Math.round((srcH - sh) / 2);
          }
          outW = targetWidth;
          outH = targetHeight;
        } else {
          // No target ratio: just downscale to max 900px long edge, preserve ratio.
          const max = 900;
          const r = Math.min(max / srcW, max / srcH, 1);
          outW = Math.round(srcW * r);
          outH = Math.round(srcH * r);
          sx = 0;
          sy = 0;
          sw = srcW;
          sh = srcH;
        }

        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        canvas.getContext("2d")?.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          setUploading(true);
          try {
            const form = new FormData();
            form.append("file", blob, "image.jpg");
            const res = await fetch("/api/upload", { method: "POST", body: form });
            if (!res.ok) throw new Error("Upload failed");
            const { url } = await res.json();
            onChange(url);
          } catch {
            alert("Image upload failed. Please try again.");
          } finally {
            setUploading(false);
          }
        }, "image/jpeg", 0.82);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold">{label}</span>
      <div className={`relative ${aspect} w-full max-w-[180px] card overflow-hidden grid place-items-center`}>
        {uploading ? (
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        ) : value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button onClick={() => onChange("")}
              className="absolute top-1.5 right-1.5 h-7 w-7 grid place-items-center rounded-full"
              style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }} aria-label="Remove">
              <X size={14} />
            </button>
          </>
        ) : (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="chip px-3 py-1.5 text-xs font-bold flex items-center gap-1 disabled:opacity-50">
          <Upload size={14} /> Upload
        </button>
        <button onClick={() => camRef.current?.click()} disabled={uploading} className="chip px-3 py-1.5 text-xs font-bold flex items-center gap-1 disabled:opacity-50">
          <Camera size={14} /> Photo
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handle} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handle} />
    </div>
  );
}
