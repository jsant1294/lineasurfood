import { NextRequest, NextResponse } from "next/server";
import { getPaymentSecrets } from "@/lib/secrets";

const PAYPAL_BASE = "https://api-m.paypal.com";

async function getAccessToken(clientId: string, secret: string): Promise<string> {
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

// POST /api/payment/paypal?action=create  → creates order, returns PayPal orderId
// POST /api/payment/paypal?action=capture → captures payment, returns status
export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  try {
    const secrets = await getPaymentSecrets();
    const { paypalSecret } = secrets;

    const body = await req.json();
    const { clientId } = body; // public clientId sent from client

    if (!clientId || !paypalSecret) {
      return NextResponse.json({ error: "PayPal not configured" }, { status: 503 });
    }

    const token = await getAccessToken(clientId, paypalSecret);

    if (action === "create") {
      const { amount, currency = "USD", orderNo } = body;
      const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [{
            reference_id: orderNo ?? "order",
            amount: { currency_code: currency, value: amount.toFixed(2) },
          }],
        }),
      });
      const data = await res.json();
      return NextResponse.json({ id: data.id });
    }

    if (action === "capture") {
      const { orderId } = body;
      const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return NextResponse.json({ status: data.status });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("PayPal error:", err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
