import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/admin-auth";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large" }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const pathname = `lineasur/images/${crypto.randomUUID()}.${ext}`;
  const blob = await put(pathname, file, { access: "public", contentType: file.type });
  return NextResponse.json({ url: blob.url });
}
