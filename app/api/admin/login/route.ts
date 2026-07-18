import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createSessionToken, isValidPin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin : "";

  if (!isValidPin(pin)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
