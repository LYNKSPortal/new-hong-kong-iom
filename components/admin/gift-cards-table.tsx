"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { GiftCard, GiftCardStatus } from "@/lib/gift-cards";
import { GiftCardModal } from "@/components/admin/gift-card-modal";

const statusStyles: Record<GiftCardStatus, string> = {
  pending: "bg-yellow-400/15 text-yellow-300",
  active: "bg-green-400/15 text-green-300",
  redeemed: "bg-white/10 text-white/50",
  cancelled: "bg-red-400/15 text-red-300",
};

const groupOrder: { key: "pending" | "declined" | "approved"; title: string; match: (status: GiftCardStatus) => boolean }[] = [
  { key: "pending", title: "Pending", match: (s) => s === "pending" },
  { key: "declined", title: "Declined", match: (s) => s === "cancelled" },
  { key: "approved", title: "Approved", match: (s) => s === "active" || s === "redeemed" },
];

const groupBadgeStyles: Record<string, string> = {
  pending: "bg-yellow-400/15 text-yellow-300",
  declined: "bg-red-400/15 text-red-300",
  approved: "bg-green-400/15 text-green-300",
};

export function GiftCardsTable({ giftCards }: { giftCards: GiftCard[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, status: GiftCardStatus) {
    setUpdating(id);
    await fetch(`/api/gift-cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-white/50">{giftCards.length} total</p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-full bg-brand-red px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-red-dark"
        >
          <Plus size={14} />
          New Gift Card
        </button>
      </div>
      {giftCards.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[.04] px-5 py-6 text-sm text-white/40">
          No gift cards yet.
        </p>
      ) : (
        <div className="space-y-10">
          {groupOrder.map(({ key, title, match }) => {
            const group = giftCards.filter((c) => match(c.status));
            return (
              <div key={key}>
                <div className="mb-3 flex items-center gap-3">
                  <h2 className="display text-2xl uppercase text-white">{title}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${groupBadgeStyles[key]}`}>
                    {group.length}
                  </span>
                </div>
                {group.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-white/[.04] px-5 py-6 text-sm text-white/40">
                    No {title.toLowerCase()} gift cards.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[.04]">
                    <table className="w-full table-fixed text-left text-sm text-white">
                      <thead className="border-b border-white/10 bg-white/[.03] text-xs uppercase tracking-wider text-white/40">
                        <tr>
                          <th className="w-[14%] px-5 py-4">Code</th>
                          <th className="w-[9%] px-5 py-4">Value</th>
                          <th className="w-[16%] px-5 py-4">Recipient</th>
                          <th className="w-[19%] px-5 py-4">Recipient Email</th>
                          <th className="w-[13%] px-5 py-4">Purchaser</th>
                          <th className="w-[10%] px-5 py-4">Status</th>
                          <th className="w-[19%] px-5 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.map((card) => (
                          <tr key={card.id} className="border-b border-white/10 last:border-0">
                            <td className="truncate px-5 py-4 font-mono font-semibold">{card.code}</td>
                            <td className="px-5 py-4">£{card.value.toFixed(2)}</td>
                            <td className="truncate px-5 py-4">{card.recipientName}</td>
                            <td className="truncate px-5 py-4 text-white/70">{card.recipientEmail}</td>
                            <td className="truncate px-5 py-4 text-white/70">{card.purchaserName || "—"}</td>
                            <td className="px-5 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusStyles[card.status]}`}>
                                {card.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {card.status === "pending" && (
                                <div className="flex gap-2">
                                  <button
                                    disabled={updating === card.id}
                                    onClick={() => updateStatus(card.id, "active")}
                                    className="rounded-full bg-green-600 px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-40"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    disabled={updating === card.id}
                                    onClick={() => updateStatus(card.id, "cancelled")}
                                    className="rounded-full bg-brand-red px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-40"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}
                              {card.status === "active" && (
                                <div className="flex gap-2">
                                  <button
                                    disabled={updating === card.id}
                                    onClick={() => updateStatus(card.id, "redeemed")}
                                    className="rounded-full bg-green-600 px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-40"
                                  >
                                    Redeem
                                  </button>
                                  <button
                                    disabled={updating === card.id}
                                    onClick={() => updateStatus(card.id, "cancelled")}
                                    className="rounded-full bg-brand-red px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-40"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                              {(card.status === "redeemed" || card.status === "cancelled") && (
                                <span className="text-xs text-white/30">—</span>
                              )}
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
        </div>
      )}
      {showCreate && (
        <GiftCardModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
