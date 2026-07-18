import { NextRequest, NextResponse } from "next/server";
import { mergeBusiness } from "@/data/business";
import { getBusinessData, writeBusinessBlob } from "@/lib/data-store";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/admin-auth";
import { Business } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getBusinessData());
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const merged = mergeBusiness(body as Partial<Business>);
  await writeBusinessBlob(merged);
  return NextResponse.json(merged);
}
