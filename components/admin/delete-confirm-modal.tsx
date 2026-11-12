"use client";
import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import type { Booking } from "@/lib/bookings";
import { formatDateDMY } from "@/lib/format";

export function DeleteConfirmModal({
  booking,
  onClose,
  onDeleted,
}: {
  booking: Booking;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Something went wrong. Please try again.");
        setDeleting(false);
        return;
      }
      onDeleted();
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-brand-charcoal p-7 text-white sm:max-w-lg sm:p-8 md:max-w-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="eyebrow text-white/60">Delete booking</p>
              <h3 className="display mt-1 text-3xl uppercase">{booking.name}</h3>
              <p className="mt-1 text-sm text-white/50">
                {formatDateDMY(booking.date)} · {booking.time} · {booking.guests} guest
                {booking.guests !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <p className="mt-5 text-sm leading-6 text-white/70">
          This will permanently delete this booking request. This cannot be undone, and the customer will not be
          notified.
        </p>
        {error && <p className="mt-3 text-sm font-semibold text-brand-red">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-full border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white/10 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full bg-brand-red px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-red-dark disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
