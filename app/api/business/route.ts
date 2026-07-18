import { NextRequest, NextResponse } from "next/server";
import { mergeBusiness } from "@/data/business";
import { getBusinessData, writeBusinessBlob } from "@/lib/data-store";
import { ADMIN_COOKIE_NAME, isValidSessionToken } from "@/lib/admin-auth";
import { Business } from "@/lib/types";
import { getPaymentSecrets, savePaymentSecrets } from "@/lib/secrets";

export async function GET() {
  return NextResponse.json(await getBusinessData());
}

// GET /api/business/secrets — admin only, returns masked secrets for the UI
export async function GET_SECRETS(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const s = await getPaymentSecrets();
  return NextResponse.json({
    stripeSecretKey: s.stripeSecretKey ? "••••••••" + s.stripeSecretKey.slice(-4) : "",
    paypalSecret: s.paypalSecret ? "••••••••" + s.paypalSecret.slice(-4) : "",
    stripeConfigured: !!s.stripeSecretKey,
    paypalConfigured: !!s.paypalSecret,
  });
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

  // Extract secrets — save to secrets blob, never store in public business blob
  const { stripeSecretKey, paypalSecret, ...rest } = body as Business & {
    stripeSecretKey?: string;
    paypalSecret?: string;
  };

  if (stripeSecretKey !== undefined || paypalSecret !== undefined) {
    const existing = await getPaymentSecrets();
    await savePaymentSecrets({
      stripeSecretKey: stripeSecretKey && stripeSecretKey !== "••••••••" + (existing.stripeSecretKey?.slice(-4) ?? "")
        ? stripeSecretKey
        : existing.stripeSecretKey,
      paypalSecret: paypalSecret && paypalSecret !== "••••••••" + (existing.paypalSecret?.slice(-4) ?? "")
        ? paypalSecret
        : existing.paypalSecret,
    });
  }

  const merged = mergeBusiness(rest as Partial<Business>);
  await writeBusinessBlob(merged);
  return NextResponse.json(merged);
}
