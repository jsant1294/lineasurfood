import { Business, CartLine, Lang, FulfillMode, OrderRecord } from "@/lib/types";

export function modTotal(l: CartLine): number {
  if (!l.mods?.length || !l.item.modifiers?.length) return 0;
  return l.mods.reduce((sum, sel) => {
    const group = l.item.modifiers!.find((g) => g.id === sel.groupId);
    if (!group) return sum;
    return sum + sel.optionIds.reduce((s, oid) => {
      const opt = group.options.find((o) => o.id === oid);
      return s + (opt?.price ?? 0);
    }, 0);
  }, 0);
}

export function lineTotal(l: CartLine): number {
  return (l.item.price + modTotal(l)) * l.qty;
}

export function subtotal(cart: CartLine[]): number {
  return cart.reduce((s, l) => s + lineTotal(l), 0);
}

export interface Totals {
  sub: number;
  delivery: number;
  tax: number;
  grand: number;
}

export function computeTotals(
  cart: CartLine[],
  business: Business,
  mode: FulfillMode
): Totals {
  const sub = subtotal(cart);
  const delivery =
    mode === "delivery" && business.deliveryEnabled ? business.deliveryFee : 0;
  const tax = business.taxEnabled ? (sub * business.taxRate) / 100 : 0;
  return { sub, delivery, tax, grand: sub + delivery + tax };
}

export function minimumFor(business: Business, mode: FulfillMode): number {
  if (mode === "delivery") return business.minimumDelivery;
  if (mode === "dinein") return business.minimumDineIn;
  return business.minimumPickup;
}

export function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

const itemName = (l: CartLine, lang: Lang) =>
  lang === "es" ? l.item.name_es : l.item.name_en;

// order number: #MMDD-NN, NN is a per-day rolling counter in LocalStorage
export function nextOrderNumber(): string {
  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  let seq = 1;
  try {
    const raw = localStorage.getItem("lineasur.orderseq.v1");
    const data = raw ? (JSON.parse(raw) as { day: string; n: number }) : null;
    seq = data && data.day === mmdd ? data.n + 1 : 1;
    localStorage.setItem(
      "lineasur.orderseq.v1",
      JSON.stringify({ day: mmdd, n: seq })
    );
  } catch {
    /* ignore */
  }
  return `#${mmdd}-${String(seq).padStart(2, "0")}`;
}

// generate available time slots between open/close from "now", honoring interval
export function generateSlots(business: Business): string[] {
  if (!business.slots.enabled) return [];
  const [oh, om] = business.hoursOpen.split(":").map(Number);
  const [ch, cm] = business.hoursClose.split(":").map(Number);
  const open = oh * 60 + om;
  const close = ch * 60 + cm;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const step = business.slots.intervalMinutes || 30;

  // first slot is the next interval boundary at least 20 min out, but not before open
  let start = Math.max(open, cur + 20);
  start = Math.ceil(start / step) * step;

  const out: string[] = [];
  for (let t = start; t <= close && out.length < 16; t += step) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = ((h + 11) % 12) + 1;
    out.push(`${h12}:${String(m).padStart(2, "0")} ${ampm}`);
  }
  return out;
}

export interface OrderForm {
  name: string;
  phone: string;
  mode: FulfillMode;
  address: string;
  slot: string;
  partySize: number;
  notes: string;
  payment: string;
}

export function buildWhatsAppMessage(
  cart: CartLine[],
  business: Business,
  form: OrderForm,
  lang: Lang,
  orderNo: string
): string {
  const totals = computeTotals(cart, business, form.mode);
  const es = lang === "es";

  const modeLabel = es
    ? { pickup: "Recoger", delivery: "Entrega a domicilio", dinein: "Comer aquí" }
    : { pickup: "Pickup", delivery: "Delivery", dinein: "Dine-in" };

  const L = es
    ? {
        hi: "Hola, quiero hacer un pedido.",
        order: "Pedido",
        name: "Nombre:",
        phone: "Teléfono:",
        mode: "Modo:",
        addr: "Dirección:",
        time: "Hora:",
        party: "Personas:",
        items: "Platillos:",
        notes: "Notas:",
        sub: "Subtotal:",
        del: "Entrega:",
        tax: "Impuesto:",
        total: "Total:",
        pay: "Método de Pago:",
      }
    : {
        hi: "Hi, I'd like to place an order.",
        order: "Order",
        name: "Name:",
        phone: "Phone:",
        mode: "Mode:",
        addr: "Address:",
        time: "Time:",
        party: "Party size:",
        items: "Items:",
        notes: "Notes:",
        sub: "Subtotal:",
        del: "Delivery:",
        tax: "Tax:",
        total: "Total:",
        pay: "Payment Method:",
      };

  const lines: string[] = [];
  lines.push(`${L.hi}`, "");
  lines.push(`${L.order} ${orderNo}`, "");
  lines.push(`${L.name} ${form.name}`);
  lines.push(`${L.phone} ${form.phone}`);
  lines.push(`${L.mode} ${modeLabel[form.mode]}`);
  if (form.mode === "delivery" && form.address) lines.push(`${L.addr} ${form.address}`);
  if (form.mode === "dinein" && form.partySize > 0) lines.push(`${L.party} ${form.partySize}`);
  if (form.slot) lines.push(`${L.time} ${form.slot}`);
  lines.push("", L.items);
  for (const l of cart) {
    lines.push(`${l.qty}x ${itemName(l, lang)} — ${money(lineTotal(l))}`);
    if (l.mods?.length && l.item.modifiers?.length) {
      for (const sel of l.mods) {
        if (!sel.optionIds.length) continue;
        const group = l.item.modifiers.find((g) => g.id === sel.groupId);
        if (!group) continue;
        const gName = lang === "es" ? group.name_es : group.name_en;
        const opts = sel.optionIds.map((oid) => {
          const o = group.options.find((op) => op.id === oid);
          return o ? (lang === "es" ? o.name_es : o.name_en) : oid;
        });
        lines.push(`   + ${gName}: ${opts.join(", ")}`);
      }
    }
    if (l.notes) lines.push(`   • ${l.notes}`);
  }
  lines.push("");
  lines.push(`${L.sub} ${money(totals.sub)}`);
  if (totals.delivery > 0) lines.push(`${L.del} ${money(totals.delivery)}`);
  if (totals.tax > 0) lines.push(`${L.tax} ${money(totals.tax)}`);
  lines.push(`${L.total} ${money(totals.grand)}`);
  lines.push("", `${L.pay} ${form.payment}`);
  if (form.notes) lines.push("", `${L.notes} ${form.notes}`);

  return lines.join("\n");
}

export function buildOrderRecord(
  cart: CartLine[],
  business: Business,
  form: OrderForm,
  orderNo: string,
  totals: Totals,
  lang: Lang
): OrderRecord {
  return {
    orderNo,
    at: Date.now(),
    name: form.name,
    phone: form.phone,
    mode: form.mode,
    ...(form.mode === "delivery" && form.address ? { address: form.address } : {}),
    ...(form.slot ? { slot: form.slot } : {}),
    ...(form.mode === "dinein" ? { partySize: form.partySize } : {}),
    payment: form.payment,
    ...(form.notes ? { notes: form.notes } : {}),
    lines: cart.map((l) => ({
      name: lang === "es" ? l.item.name_es : l.item.name_en,
      qty: l.qty,
      unitPrice: l.item.price + modTotal(l),
      mods: (l.mods ?? [])
        .filter((sel) => sel.optionIds.length > 0)
        .map((sel) => {
          const group = l.item.modifiers?.find((g) => g.id === sel.groupId);
          return {
            group: group ? (lang === "es" ? group.name_es : group.name_en) : sel.groupId,
            options: sel.optionIds.map((oid) => {
              const o = group?.options.find((op) => op.id === oid);
              return o ? (lang === "es" ? o.name_es : o.name_en) : oid;
            }),
          };
        }),
      lineTotal: lineTotal(l),
    })),
    sub: totals.sub,
    delivery: totals.delivery,
    tax: totals.tax,
    grand: totals.grand,
  };
}

export function whatsappUrl(number: string, message: string): string {
  const clean = number.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function isOpenNow(business: Business): boolean {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = business.hoursOpen.split(":").map(Number);
  const [ch, cm] = business.hoursClose.split(":").map(Number);
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}
