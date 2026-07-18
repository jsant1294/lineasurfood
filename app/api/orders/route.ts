import { NextRequest, NextResponse } from "next/server";
import { appendOrder, getOrders } from "@/lib/orders";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/admin-auth";
import { OrderRecord } from "@/lib/types";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const date = req.nextUrl.searchParams.get("date") ?? undefined;
  return NextResponse.json(await getOrders(date));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  await appendOrder(body as OrderRecord);
  return NextResponse.json({ ok: true });
}
