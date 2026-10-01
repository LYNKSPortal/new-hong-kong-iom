"use client";
import { useState } from "react";
import { X } from "lucide-react";
import type { Booking, BookingStatus } from "@/lib/bookings";

type ResponseAction = { booking: Booking; status: Extract<BookingStatus, "approved" | "declined"> };

export function ResponseModal({
  action,
  onClose,
  onSubmitted,
}: {
  action: ResponseAction;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [note, setNote] = useState(action.booking.adminNotes ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    await fetch(`/api/bookings/${action.booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action.status, note }),
    });
    setSubmitting(false);
    onSubmitted();
  }

  const isApprove = action.status === "approved";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-charcoal p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-white/60">{isApprove ? "Approve" : "Decline"} booking</p>
            <h3 className="display mt-2 text-3xl uppercase">{action.booking.name}</h3>
            <p className="mt-1 text-sm text-white/50">
              {action.booking.date} · {action.booking.time} · {action.booking.guests} guest
              {action.booking.guests !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <label className="mt-6 block text-sm font-semibold">
          Note to customer (optional)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder={
              isApprove
                ? "e.g. Looking forward to seeing you! We've reserved a table for you."
                : "e.g. Sorry, we're fully booked that evening — would another time work?"
            }
            className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-red"
          />
        </label>
        <p className="mt-2 text-xs text-white/40">This note will be sent to the customer along with the status update.</p>
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
            className={`rounded-full px-5 py-3 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50 ${
              isApprove ? "bg-green-600 hover:bg-green-700" : "bg-brand-red hover:bg-brand-red-dark"
            }`}
          >
            {submitting ? "Sending…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
