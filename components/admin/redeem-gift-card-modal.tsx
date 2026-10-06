"use client";
import { useState } from "react";
import { X } from "lucide-react";
import type { GiftCard } from "@/lib/gift-cards";

export function RedeemGiftCardModal({
  giftCard,
  onClose,
  onRedeemed,
}: {
  giftCard: GiftCard;
  onClose: () => void;
  onRedeemed: () => void;
}) {
  const [amount, setAmount] = useState(giftCard.balance.toFixed(2));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/gift-cards/${giftCard.id}/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, note: note || undefined }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Something went wrong redeeming this gift card.");
      return;
    }
    onRedeemed();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-charcoal p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-white/60">Redeem gift card</p>
            <h3 className="display mt-2 text-3xl uppercase">{giftCard.code}</h3>
            <p className="mt-1 text-sm text-white/50">
              {giftCard.recipientName} · Balance £{giftCard.balance.toFixed(2)} of £{giftCard.value.toFixed(2)}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <label className="mt-6 block text-sm font-semibold">
          Amount to redeem (£)
          <input
            type="number"
            min={0.01}
            max={giftCard.balance}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-red"
          />
        </label>
        <button
          type="button"
          onClick={() => setAmount(giftCard.balance.toFixed(2))}
          className="mt-2 text-xs font-semibold text-white/50 underline hover:text-white"
        >
          Use full remaining balance (£{giftCard.balance.toFixed(2)})
        </button>
        <label className="mt-5 block text-sm font-semibold">
          Note (optional)
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Used towards table 4, dinner for two"
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-red"
          />
        </label>
        {Number(amount) > 0 && Number(amount) < giftCard.balance && (
          <p className="mt-2 text-xs text-white/40">
            £{(giftCard.balance - Number(amount)).toFixed(2)} will remain on this card.
          </p>
        )}
        {error && <p className="mt-3 text-sm font-semibold text-brand-red">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white/10 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full bg-green-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Redeeming…" : "Redeem"}
          </button>
        </div>
      </div>
    </div>
  );
}
