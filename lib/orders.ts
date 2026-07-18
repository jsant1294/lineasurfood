import { put, head } from "@vercel/blob";
import { OrderRecord } from "@/lib/types";

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const orderPath = (key: string) => `lineasur/orders/${key}.json`;

async function readOrders(key: string): Promise<OrderRecord[]> {
  try {
    const meta = await head(orderPath(key));
    const res = await fetch(meta.url, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as OrderRecord[];
  } catch {
    return [];
  }
}

export async function appendOrder(record: OrderRecord): Promise<void> {
  const key = todayKey();
  const existing = await readOrders(key);
  await put(orderPath(key), JSON.stringify([...existing, record]), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function getOrders(dateKey?: string): Promise<OrderRecord[]> {
  return readOrders(dateKey ?? todayKey());
}
