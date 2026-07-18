import { cache } from "react";
import { head, put } from "@vercel/blob";
import { Business, MenuItem } from "@/lib/types";
import { mergeBusiness } from "@/data/business";
import { SAMPLE_MENU } from "@/data/menu";

const BUSINESS_PATH = "lineasur/business.json";
const MENU_PATH = "lineasur/menu.json";

async function readJson<T>(pathname: string): Promise<T | null> {
  try {
    const meta = await head(pathname);
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null; // not uploaded yet, or transient error — caller falls back to defaults
  }
}

async function writeJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

export function readBusinessBlob() {
  return readJson<Partial<Business>>(BUSINESS_PATH);
}

export function writeBusinessBlob(data: Business) {
  return writeJson(BUSINESS_PATH, data);
}

export function readMenuBlob() {
  return readJson<MenuItem[]>(MENU_PATH);
}

export function writeMenuBlob(data: MenuItem[]) {
  return writeJson(MENU_PATH, data);
}

// Deduped per-request (shared between generateMetadata, the root layout, and route handlers).
export const getBusinessData = cache(async (): Promise<Business> => {
  const stored = await readBusinessBlob();
  return mergeBusiness(stored);
});

export const getMenuData = cache(async (): Promise<MenuItem[]> => {
  const stored = await readMenuBlob();
  return stored ?? SAMPLE_MENU;
});
