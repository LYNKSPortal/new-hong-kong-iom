"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, History } from "lucide-react";
import type { Booking, BookingStatus } from "@/lib/bookings";
import { ResponseModal } from "@/components/admin/response-modal";
import { formatDateDMY } from "@/lib/format";

type PendingAction = { booking: Booking; status: Extract<BookingStatus, "approved" | "declined"> };
type Tab = "current" | "history";

const statusStyles: Record<BookingStatus, string> = {
  pending: "bg-yellow-400/15 text-yellow-300",
  approved: "bg-green-400/15 text-green-300",
  declined: "bg-red-400/15 text-red-300",
};

const groupOrder: { status: BookingStatus; title: string }[] = [
  { status: "pending", title: "Pending" },
  { status: "approved", title: "Approved" },
  { status: "declined", title: "Declined" },
];

const CURRENT_WINDOW_DAYS = 14;

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isWithinCurrentWindow(booking: Booking, windowStartISO: string, windowEndISO: string): boolean {
  return booking.date >= windowStartISO && booking.date <= windowEndISO;
}

function sortByDateTimeAsc(a: Booking, b: Booking) {
  return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
}

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [tab, setTab] = useState<Tab>("current");

  if (bookings.length === 0) {
    return <p className="text-sm text-white/50">No booking requests yet.</p>;
  }

  const windowStartISO = toISODate(new Date());
  const windowEnd = new Date();
  windowEnd.setDate(windowEnd.getDate() + CURRENT_WINDOW_DAYS);
  const windowEndISO = toISODate(windowEnd);

  const currentBookings = bookings.filter((b) => isWithinCurrentWindow(b, windowStartISO, windowEndISO));
  const historyBookings = bookings
    .filter((b) => !isWithinCurrentWindow(b, windowStartISO, windowEndISO))
    .sort((a, b) => sortByDateTimeAsc(b, a));

  const pendingCount = currentBookings.filter((b) => b.status === "pending").length;

  return (
    <div className="flex flex-col gap-8 sm:flex-row">
      <nav className="flex shrink-0 gap-2 overflow-x-auto sm:w-56 sm:flex-col sm:overflow-visible">
        <TabButton active={tab === "current"} onClick={() => setTab("current")} icon={Clock} label="Current Bookings" hint={pendingCount > 0 ? `${pendingCount} pending` : undefined} />
        <TabButton active={tab === "history"} onClick={() => setTab("history")} icon={History} label="History" hint={`${historyBookings.length} total`} />
      </nav>

      <div className="min-w-0 flex-1 space-y-10">
        {tab === "current" ? (
          <>
            <p className="text-xs text-white/40">
              Bookings dated from today through the next {CURRENT_WINDOW_DAYS} days. Anything outside that window
              moves automatically into History.
            </p>
            {groupOrder.map(({ status, title }) => {
              const group = currentBookings.filter((b) => b.status === status).sort(sortByDateTimeAsc);
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
                    <BookingsTableGrid bookings={group} onAction={setPendingAction} />
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <div>
            <div className="mb-3 flex items-center gap-3">
              <h2 className="display text-2xl uppercase text-white">History</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase text-white/50">
                {historyBookings.length}
              </span>
            </div>
            <p className="mb-5 text-xs text-white/40">
              Bookings dated outside the next {CURRENT_WINDOW_DAYS} days (past or further out), across every status.
            </p>
            {historyBookings.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/[.04] px-5 py-6 text-sm text-white/40">
                No history yet.
              </p>
            ) : (
              <BookingsTableGrid bookings={historyBookings} onAction={setPendingAction} showStatus />
            )}
          </div>
        )}
      </div>

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

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition sm:shrink ${
        active
          ? "border-brand-red bg-brand-red/10 text-white"
          : "border-white/10 bg-white/[.04] text-white/60 hover:border-white/20 hover:text-white"
      }`}
    >
      <Icon size={17} className={active ? "text-brand-red" : "text-white/40"} />
      <span>
        <span className="block text-sm font-bold uppercase tracking-wide">{label}</span>
        {hint && <span className="block text-xs text-white/40">{hint}</span>}
      </span>
    </button>
  );
}

function BookingsTableGrid({
  bookings,
  onAction,
  showStatus = false,
}: {
  bookings: Booking[];
  onAction: (action: PendingAction) => void;
  showStatus?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[.04]">
      <table className="w-full min-w-[960px] text-left text-sm text-white">
        <thead className="border-b border-white/10 bg-white/[.03] text-xs uppercase tracking-wider text-white/40">
          <tr>
            <th className="whitespace-nowrap px-5 py-4">Guest</th>
            <th className="whitespace-nowrap px-5 py-4">Email</th>
            <th className="whitespace-nowrap px-5 py-4">Phone</th>
            <th className="whitespace-nowrap px-5 py-4">Party</th>
            <th className="whitespace-nowrap px-5 py-4">Date</th>
            <th className="whitespace-nowrap px-5 py-4">Time</th>
            {showStatus && <th className="whitespace-nowrap px-5 py-4">Status</th>}
            <th className="w-full px-5 py-4">Notes</th>
            <th className="whitespace-nowrap px-5 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-white/10 last:border-0">
              <td className="max-w-[160px] truncate px-5 py-4 font-semibold">{booking.name}</td>
              <td className="max-w-[200px] truncate px-5 py-4 text-white/70">{booking.email}</td>
              <td className="whitespace-nowrap px-5 py-4 text-white/70">{booking.phone}</td>
              <td className="whitespace-nowrap px-5 py-4">
                {booking.guests} guest{booking.guests !== 1 ? "s" : ""}
              </td>
              <td className="whitespace-nowrap px-5 py-4">{formatDateDMY(booking.date)}</td>
              <td className="whitespace-nowrap px-5 py-4">{booking.time}</td>
              {showStatus && (
                <td className="whitespace-nowrap px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusStyles[booking.status]}`}>
                    {booking.status}
                  </span>
                </td>
              )}
              <td className="min-w-[220px] px-5 py-4 text-white/50">
                <p className="truncate">{booking.notes || "—"}</p>
                {booking.adminNotes && (
                  <p className="mt-1 truncate text-xs text-white/40">Reply sent: “{booking.adminNotes}”</p>
                )}
              </td>
              <td className="px-5 py-4">
                <div className="flex gap-2 whitespace-nowrap">
                  <button
                    disabled={booking.status === "approved"}
                    onClick={() => onAction({ booking, status: "approved" })}
                    className="rounded-full bg-green-600 px-4 py-2 text-xs font-bold uppercase text-white disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    disabled={booking.status === "declined"}
                    onClick={() => onAction({ booking, status: "declined" })}
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
  );
}
