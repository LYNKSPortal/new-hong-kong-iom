"use client";
import { useState, type FormEvent } from "react";
import { X } from "lucide-react";

export function GiftCardModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/gift-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        value: form.get("value"),
        recipientName: form.get("recipientName"),
        recipientEmail: form.get("recipientEmail"),
        purchaserName: form.get("purchaserName"),
        purchaserEmail: form.get("purchaserEmail"),
        message: form.get("message"),
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Something went wrong creating the gift card. Please check the details and try again.");
      return;
    }
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-charcoal p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-white/60">New Hong Kong</p>
            <h3 className="display mt-2 text-3xl uppercase">New Gift Card</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">
            Value (£)
            <input
              name="value"
              type="number"
              min={1}
              max={1000}
              step="0.01"
              required
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-red"
            />
          </label>
          <label className="block text-sm font-semibold">
            Recipient name
            <input
              name="recipientName"
              required
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-red"
            />
          </label>
          <label className="block text-sm font-semibold">
            Recipient email
            <input
              name="recipientEmail"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-red"
            />
          </label>
          <label className="block text-sm font-semibold">
            Purchaser name (optional)
            <input
              name="purchaserName"
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-red"
            />
          </label>
          <label className="block text-sm font-semibold">
            Purchaser email (optional)
            <input
              name="purchaserEmail"
              type="email"
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-red"
            />
          </label>
          <label className="block text-sm font-semibold">
            Message (optional)
            <textarea
              name="message"
              rows={3}
              className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-red"
            />
          </label>
          {error && <p className="text-sm font-semibold text-brand-red">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white/10 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-brand-red px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-red-dark disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create Gift Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
