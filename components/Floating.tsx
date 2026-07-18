"use client";

import { MessageCircle, ShoppingBag } from "lucide-react";

export function FloatingWhatsApp({ number }: { number: string }) {
  const clean = number.replace(/\D/g, "");
  return (
    <a
      href={`https://wa.me/${clean}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 z-30 h-14 w-14 grid place-items-center rounded-full shadow-lg"
      style={{ background: "#25D366", color: "#fff" }}
      aria-label="WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
}

export function FloatingCart({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 z-30 h-14 px-5 grid place-items-center rounded-full shadow-lg btn-primary"
      aria-label="Open cart"
    >
      <span className="flex items-center gap-2 font-extrabold">
        <ShoppingBag size={22} />
        {count > 0 && <span>{count}</span>}
      </span>
    </button>
  );
}
