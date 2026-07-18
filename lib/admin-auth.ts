import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "lineasur_admin_session";

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}

export function isValidPin(pin: string): boolean {
  const expected = process.env.ADMIN_PIN;
  return Boolean(expected) && pin === expected;
}

export function createSessionToken(): string {
  return createHmac("sha256", getSecret()).update("admin").digest("hex");
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = createSessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
