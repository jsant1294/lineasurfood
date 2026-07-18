"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { useCart } from "@/lib/cart";
import ThemeRoot from "@/components/ThemeRoot";
import { t } from "@/lib/i18n";
import {
  computeTotals, money, buildWhatsAppMessage, whatsappUrl,
  OrderForm, generateSlots, nextOrderNumber, minimumFor, buildOrderRecord,
} from "@/lib/order";
import { FulfillMode } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MessageCircle, ShoppingBag, Truck, Utensils,
  Minus, Plus, CreditCard, Loader2,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements, CardElement, useStripe, useElements,
} from "@stripe/react-stripe-js";

// ── Stripe card form ───────────────────────────────────────────────────────
function StripeForm({
  amount, orderNo, onSuccess,
}: { amount: number; orderNo: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pay = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/payment/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, orderNo }),
      });
      const { clientSecret, error } = await res.json();
      if (error) { setErr(error); setBusy(false); return; }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });
      if (result.error) {
        setErr(result.error.message ?? "Payment failed");
        setBusy(false);
      } else {
        onSuccess();
      }
    } catch {
      setErr("Payment failed — please try again");
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="p-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <CardElement options={{
          style: {
            base: { fontSize: "15px", color: "var(--text)", "::placeholder": { color: "var(--text-muted)" } },
          },
        }} />
      </div>
      {err && <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>{err}</p>}
      <button
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
        onClick={pay}
        disabled={busy || !stripe}
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
        {busy ? "Processing…" : `Pay ${money(amount)}`}
      </button>
    </div>
  );
}

// ── PayPal button ──────────────────────────────────────────────────────────
function PayPalButton({
  amount, clientId, orderNo, onSuccess,
}: { amount: number; clientId: string; orderNo: string; onSuccess: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const containerId = "paypal-button-container";

  useEffect(() => {
    if (!clientId) return;
    const existing = document.getElementById("paypal-sdk");
    if (existing) { renderButtons(); return; }
    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.onload = renderButtons;
    document.body.appendChild(script);

    function renderButtons() {
      const w = window as unknown as { paypal?: { Buttons: (opts: object) => { render: (id: string) => void } } };
      if (!w.paypal) return;
      w.paypal.Buttons({
        createOrder: async () => {
          setBusy(true);
          const res = await fetch("/api/payment/paypal?action=create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId, amount, orderNo }),
          });
          const data = await res.json();
          setBusy(false);
          return data.id;
        },
        onApprove: async (data: { orderID: string }) => {
          setBusy(true);
          const res = await fetch("/api/payment/paypal?action=capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId, orderId: data.orderID }),
          });
          const result = await res.json();
          setBusy(false);
          if (result.status === "COMPLETED") { onSuccess(); }
          else { setErr("Payment not completed — please try again"); }
        },
        onError: () => { setBusy(false); setErr("PayPal error — please try again"); },
      }).render(`#${containerId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return (
    <div className="flex flex-col gap-2">
      {busy && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <Loader2 size={16} className="animate-spin" /> Processing…
        </div>
      )}
      {err && <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>{err}</p>}
      <div id={containerId} />
    </div>
  );
}

// ── Main checkout page ─────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { business, lang } = useStore();
  const { cart, clearCart, saveLastOrder } = useCart();
  const router = useRouter();

  const payOptions = useMemo(() => [
    business.paymentMethods.cash && (lang === "es" ? "Efectivo" : "Cash"),
    business.paymentMethods.zelle && "Zelle",
    business.paymentMethods.cashApp && "Cash App",
    business.paymentMethods.venmo && "Venmo",
    business.paymentMethods.card && (lang === "es" ? "Tarjeta" : "Card"),
  ].filter(Boolean) as string[], [business.paymentMethods, lang]);

  const enabledModes = useMemo<FulfillMode[]>(() => [
    business.pickupEnabled && ("pickup" as const),
    business.deliveryEnabled && ("delivery" as const),
    business.dineInEnabled && ("dinein" as const),
  ].filter(Boolean) as FulfillMode[], [business.pickupEnabled, business.deliveryEnabled, business.dineInEnabled]);

  const firstMode: FulfillMode = enabledModes[0] ?? "pickup";

  const [form, setForm] = useState<OrderForm>({
    name: "", phone: "", mode: firstMode, address: "",
    slot: "", partySize: 2, notes: "", payment: payOptions[0] ?? "",
  });
  const [payStep, setPayStep] = useState(false);
  const [paidVia, setPaidVia] = useState<"stripe" | "paypal" | null>(null);

  useEffect(() => {
    if (enabledModes.length > 0 && !enabledModes.includes(form.mode)) {
      setForm((f) => ({ ...f, mode: enabledModes[0] }));
    }
  }, [enabledModes, form.mode]);

  const slots = useMemo(() => generateSlots(business), [business]);
  const totals = computeTotals(cart, business, form.mode);
  const min = minimumFor(business, form.mode);
  const set = <K extends keyof OrderForm>(k: K, v: OrderForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onlineEnabled = business.onlinePayment.stripeEnabled || business.onlinePayment.paypalEnabled;

  const formValid =
    enabledModes.length > 0 &&
    form.name.trim() &&
    form.phone.trim() &&
    (form.mode !== "delivery" || form.address.trim()) &&
    totals.sub >= min;

  const orderNo = useMemo(() => nextOrderNumber(), []);

  const sendOrder = useCallback((via: string) => {
    const msg = buildWhatsAppMessage(cart, business, form, lang, orderNo);
    const record = buildOrderRecord(cart, business, form, orderNo, totals, lang);
    const url = whatsappUrl(business.whatsappNumber, msg + (via !== "whatsapp" ? `\n✅ Paid via ${via}` : ""));
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...record, payment: via !== "whatsapp" ? `Online (${via})` : record.payment }),
    }).catch(() => {});
    saveLastOrder(form.mode);
    window.open(url, "_blank", "noopener,noreferrer");
    clearCart();
    router.push("/");
  }, [cart, business, form, lang, orderNo, totals, saveLastOrder, clearCart, router]);

  // Stripe promise — only created when key is present
  const stripePromise = useMemo(
    () => business.onlinePayment.stripePublishableKey
      ? loadStripe(business.onlinePayment.stripePublishableKey)
      : null,
    [business.onlinePayment.stripePublishableKey]
  );

  if (cart.length === 0) {
    return (
      <ThemeRoot themeId={business.theme}>
        <div className="min-h-screen grid place-items-center p-6 text-center">
          <div>
            <p className="font-bold text-lg">{t("emptyCart", lang)}</p>
            <button className="btn-primary px-5 py-2.5 mt-4" onClick={() => router.push("/")}>
              {t("backToMenu", lang)}
            </button>
          </div>
        </div>
      </ThemeRoot>
    );
  }

  return (
    <ThemeRoot themeId={business.theme}>
      <div className="max-w-md mx-auto pb-36">
        <header className="flex items-center gap-3 p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <button onClick={() => payStep ? setPayStep(false) : router.push("/")}
            className="h-9 w-9 grid place-items-center card" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-extrabold brand-font">
            {payStep ? (lang === "es" ? "Pago" : "Payment") : t("checkout", lang)}
          </h1>
        </header>

        {!payStep ? (
          /* ── ORDER FORM ── */
          <div className="p-4 flex flex-col gap-4">
            <Field label={t("customerName", lang)}>
              <input className="w-full p-2.5" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label={t("phone", lang)}>
              <input className="w-full p-2.5" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="404-555-5555" />
            </Field>

            <div>
              <p className="text-sm font-bold mb-1.5">{t("howReceive", lang)}</p>
              <div className="grid grid-cols-3 gap-2">
                {business.pickupEnabled && (
                  <ModeBtn active={form.mode === "pickup"} onClick={() => set("mode", "pickup")}>
                    <ShoppingBag size={16} /> {t("pickup", lang)}
                  </ModeBtn>
                )}
                {business.deliveryEnabled && (
                  <ModeBtn active={form.mode === "delivery"} onClick={() => set("mode", "delivery")}>
                    <Truck size={16} /> {t("delivery", lang)}
                  </ModeBtn>
                )}
                {business.dineInEnabled && (
                  <ModeBtn active={form.mode === "dinein"} onClick={() => set("mode", "dinein")}>
                    <Utensils size={16} /> {t("dinein", lang)}
                  </ModeBtn>
                )}
              </div>
              {enabledModes.length === 0 && (
                <p className="text-sm mt-1" style={{ color: "var(--accent)" }}>{t("noModes", lang)}</p>
              )}
              {form.mode === "dinein" && (
                <p className="text-xs mt-2" style={{ color: "var(--accent)" }}>{t("comeEat", lang)} · {business.address}</p>
              )}
            </div>

            {form.mode === "delivery" && (
              <Field label={t("address", lang)}>
                <input className="w-full p-2.5" value={form.address} onChange={(e) => set("address", e.target.value)} />
              </Field>
            )}

            {form.mode === "dinein" && (
              <Field label={t("partySize", lang)}>
                <div className="flex items-center gap-3">
                  <button onClick={() => set("partySize", Math.max(1, form.partySize - 1))} className="h-9 w-9 grid place-items-center card" aria-label="minus"><Minus size={16} /></button>
                  <span className="w-8 text-center font-bold text-lg">{form.partySize}</span>
                  <button onClick={() => set("partySize", form.partySize + 1)} className="h-9 w-9 grid place-items-center card" aria-label="plus"><Plus size={16} /></button>
                </div>
              </Field>
            )}

            {business.slots.enabled && (
              <Field label={t("pickupTime", lang)}>
                {slots.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("noSlots", lang)}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <button key={s} className="chip px-3 py-1.5 text-sm font-bold" data-active={form.slot === s} onClick={() => set("slot", s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </Field>
            )}

            <Field label={t("orderNotes", lang)}>
              <textarea className="w-full p-2.5 resize-none" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder={t("notesPlaceholder", lang)} />
            </Field>

            {!onlineEnabled && (
              <Field label={t("paymentMethod", lang)}>
                <div className="flex flex-wrap gap-2">
                  {payOptions.map((p) => (
                    <button key={p} className="chip px-3 py-1.5 text-sm font-bold" data-active={form.payment === p} onClick={() => set("payment", p)}>
                      {p}
                    </button>
                  ))}
                </div>
              </Field>
            )}

            <div className="card p-4 flex flex-col gap-1.5">
              <SummaryRow label={t("subtotal", lang)} value={money(totals.sub)} />
              {totals.delivery > 0 && <SummaryRow label={t("deliveryFee", lang)} value={money(totals.delivery)} />}
              {totals.tax > 0 && <SummaryRow label={`${t("tax", lang)} (${business.taxRate}%)`} value={money(totals.tax)} />}
              <div className="h-px my-1" style={{ background: "var(--border)" }} />
              <SummaryRow label={t("total", lang)} value={money(totals.grand)} big />
              {totals.sub < min && (
                <p className="text-xs mt-1" style={{ color: "var(--accent)" }}>
                  {t("minOrderNotice", lang)}: {money(min)}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* ── PAYMENT STEP ── */
          <div className="p-4 flex flex-col gap-5">
            <div className="card p-4 flex flex-col gap-1.5">
              <SummaryRow label={t("total", lang)} value={money(totals.grand)} big />
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{form.name} · {form.phone}</p>
            </div>

            {business.onlinePayment.stripeEnabled && stripePromise && (
              <div className="card p-4 flex flex-col gap-3">
                <p className="font-bold text-sm flex items-center gap-2"><CreditCard size={16} /> Pay by Card</p>
                <Elements stripe={stripePromise}>
                  <StripeForm
                    amount={totals.grand}
                    orderNo={orderNo}
                    onSuccess={() => { setPaidVia("stripe"); sendOrder("Stripe"); }}
                  />
                </Elements>
              </div>
            )}

            {business.onlinePayment.paypalEnabled && business.onlinePayment.paypalClientId && (
              <div className="card p-4 flex flex-col gap-3">
                <p className="font-bold text-sm">Pay with PayPal</p>
                <PayPalButton
                  amount={totals.grand}
                  clientId={business.onlinePayment.paypalClientId}
                  orderNo={orderNo}
                  onSuccess={() => { setPaidVia("paypal"); sendOrder("PayPal"); }}
                />
              </div>
            )}

            {paidVia && (
              <p className="text-sm text-center font-bold" style={{ color: "#10b981" }}>
                ✅ Paid via {paidVia} — opening WhatsApp…
              </p>
            )}
          </div>
        )}

        {/* ── BOTTOM CTA ── */}
        <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto p-4 flex flex-col gap-2"
          style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
          {!payStep && onlineEnabled && (
            <button
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={!formValid}
              onClick={() => setPayStep(true)}
            >
              <CreditCard size={20} /> {lang === "es" ? "Continuar al Pago" : "Continue to Payment"} · {money(totals.grand)}
            </button>
          )}
          {!payStep && !onlineEnabled && (
            <button
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={!formValid}
              onClick={() => sendOrder("whatsapp")}
            >
              <MessageCircle size={20} /> {t("generateOrder", lang)} · {money(totals.grand)}
            </button>
          )}
          {!payStep && onlineEnabled && payOptions.length > 0 && (
            <button
              className="w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
              style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              disabled={!formValid}
              onClick={() => sendOrder("whatsapp")}
            >
              <MessageCircle size={16} /> {lang === "es" ? "Pagar al recibir (WhatsApp)" : "Pay on delivery (WhatsApp)"}
            </button>
          )}
        </div>
      </div>
    </ThemeRoot>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}
function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="chip py-2.5 text-sm font-bold flex items-center justify-center gap-1.5" data-active={active} onClick={onClick}>
      {children}
    </button>
  );
}
function SummaryRow({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex justify-between" style={{ color: big ? "var(--text)" : "var(--text-muted)" }}>
      <span className={big ? "font-extrabold" : "text-sm"}>{label}</span>
      <span className={big ? "font-extrabold text-lg" : "text-sm font-bold"}>{value}</span>
    </div>
  );
}
