import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getPaymentSecrets } from "@/lib/secrets";

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = "usd", orderNo } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const secrets = await getPaymentSecrets();
    if (!secrets.stripeSecretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const stripe = new Stripe(secrets.stripeSecretKey);
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency,
      metadata: { orderNo: orderNo ?? "" },
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: "Payment setup failed" }, { status: 500 });
  }
}
