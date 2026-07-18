import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/admin-auth";
import { getPaymentSecrets } from "@/lib/secrets";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const s = await getPaymentSecrets();
  return NextResponse.json({
    stripeConfigured: !!s.stripeSecretKey,
    paypalConfigured: !!s.paypalSecret,
  });
}
