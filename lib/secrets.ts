import { put, head } from "@vercel/blob";

export interface PaymentSecrets {
  stripeSecretKey: string;
  paypalSecret: string;
}

const SECRETS_PATH = "lineasur/payment-secrets.json";

const EMPTY: PaymentSecrets = { stripeSecretKey: "", paypalSecret: "" };

export async function getPaymentSecrets(): Promise<PaymentSecrets> {
  try {
    const info = await head(SECRETS_PATH);
    const res = await fetch(info.url, { cache: "no-store" });
    if (!res.ok) return EMPTY;
    return (await res.json()) as PaymentSecrets;
  } catch {
    return EMPTY;
  }
}

export async function savePaymentSecrets(secrets: PaymentSecrets): Promise<void> {
  await put(SECRETS_PATH, JSON.stringify(secrets), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}
