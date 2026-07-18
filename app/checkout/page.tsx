"use client";

import { useState, useMemo, useEffect } from "react";
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
import { ArrowLeft, MessageCircle, ShoppingBag, Truck, Utensils, Minus, Plus } from "lucide-react";

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

  // if the selected mode gets turned off in admin, fall back to a valid one
  useEffect(() => {
    if (enabledModes.length > 0 && !enabledModes.includes(form.mode)) {
      setForm((f) => ({ ...f, mode: enabledModes[0] }));
    }
  }, [enabledModes, form.mode]);

  const slots = useMemo(() => generateSlots(business), [business]);
  const totals = computeTotals(cart, business, form.mode);
  const min = minimumFor(business, form.mode);
  const set = <K extends keyof OrderForm>(k: K, v: OrderForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const valid =
    enabledModes.length > 0 &&
    form.name.trim() &&
    form.phone.trim() &&
    (form.mode !== "delivery" || form.address.trim()) &&
    totals.sub >= min;

  const submit = () => {
    const orderNo = nextOrderNumber();
    const msg = buildWhatsAppMessage(cart, business, form, lang, orderNo);
    const url = whatsappUrl(business.whatsappNumber, msg);
    const record = buildOrderRecord(cart, business, form, orderNo, totals, lang);
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    }).catch(() => {});
    saveLastOrder(form.mode);
    window.open(url, "_blank", "noopener,noreferrer");
    clearCart();
    router.push("/");
  };

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
          <button onClick={() => router.push("/")} className="h-9 w-9 grid place-items-center card" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-extrabold brand-font">{t("checkout", lang)}</h1>
        </header>

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

          <Field label={t("paymentMethod", lang)}>
            <div className="flex flex-wrap gap-2">
              {payOptions.map((p) => (
                <button key={p} className="chip px-3 py-1.5 text-sm font-bold" data-active={form.payment === p} onClick={() => set("payment", p)}>
                  {p}
                </button>
              ))}
            </div>
          </Field>

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

        <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto p-4" style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
          <button
            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={!valid}
            onClick={submit}
          >
            <MessageCircle size={20} /> {t("generateOrder", lang)} · {money(totals.grand)}
          </button>
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
