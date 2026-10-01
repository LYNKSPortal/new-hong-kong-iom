"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, BookingStatus } from "@/lib/bookings";
import { ResponseModal } from "@/components/admin/response-modal";

type PendingAction = { booking: Booking; status: Extract<BookingStatus, "approved" | "declined"> };

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-yellow-400/15 text-yellow-300",
  approved: "bg-green-400/15 text-green-300",
  declined: "bg-red-400/15 text-red-300",
};

const groupOrder: { status: BookingStatus; title: string }[] = [
  { status: "pending", title: "Pending" },
  { status: "declined", title: "Declined" },
  { status: "approved", title: "Approved" },
];

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  if (bookings.length === 0) {
    return <p className="text-sm text-white/50">No booking requests yet.</p>;
  }

  return (
    <div className="space-y-10">
      {groupOrder.map(({ status, title }) => {
        const group = bookings.filter((b) => b.status === status);
        return (
          <div key={status}>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="display text-2xl uppercase text-white">{title}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusStyles[status]}`}>
                {group.length}
              </span>
            </div>
            {group.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/[.04] px-5 py-6 text-sm text-white/40">
                No {title.toLowerCase()} bookings.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[.04]">
                <table className="w-full table-fixed text-left text-sm text-white">
                  <thead className="border-b border-white/10 bg-white/[.03] text-xs uppercase tracking-wider text-white/40">
                    <tr>
                      <th className="w-[13%] px-5 py-4">Guest</th>
                      <th className="w-[18%] px-5 py-4">Email</th>
                      <th className="w-[12%] px-5 py-4">Phone</th>
                      <th className="w-[9%] px-5 py-4">Party</th>
                      <th className="w-[9%] px-5 py-4">Date</th>
                      <th className="w-[7%] px-5 py-4">Time</th>
                      <th className="w-[20%] px-5 py-4">Notes</th>
                      <th className="w-[12%] px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((booking) => (
                      <tr key={booking.id} className="border-b border-white/10 last:border-0">
                        <td className="truncate px-5 py-4 font-semibold">{booking.name}</td>
                        <td className="truncate px-5 py-4 text-white/70">{booking.email}</td>
                        <td className="truncate px-5 py-4 text-white/70">{booking.phone}</td>
                        <td className="px-5 py-4">
                          {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
                        </td>
                        <td className="px-5 py-4">{booking.date}</td>
                        <td className="px-5 py-4">{booking.time}</td>
                        <td className="px-5 py-4 text-white/50">
                          <p className="truncate">{booking.notes || "—"}</p>
                          {booking.adminNotes && (
                            <p className="mt-1 truncate text-xs text-white/40">Reply sent: “{booking.adminNotes}”</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              disabled={booking.status === "approved"}
                              onClick={() => setPendingAction({ booking, status: "approved" })}
                              className="rounded-full bg-green-600 px-4 py-2 text-xs font-bold uppercase text-white disabled:opacity-40"
                            >
                              Approve
                            </button>
                            <button
                              disabled={booking.status === "declined"}
                              onClick={() => setPendingAction({ booking, status: "declined" })}
                              className="rounded-full bg-brand-red px-4 py-2 text-xs font-bold uppercase text-white disabled:opacity-40"
                            >
                              Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
      {pendingAction && (
        <ResponseModal
          action={pendingAction}
          onClose={() => setPendingAction(null)}
          onSubmitted={() => {
            setPendingAction(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
