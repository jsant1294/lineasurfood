import { NextRequest, NextResponse } from "next/server";
import { getMenuData, writeMenuBlob } from "@/lib/data-store";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/admin-auth";
import { MenuItem } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getMenuData());
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const items = body as MenuItem[];
  await writeMenuBlob(items);
  return NextResponse.json(items);
}
