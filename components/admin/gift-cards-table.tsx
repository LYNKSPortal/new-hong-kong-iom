"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { GiftCard, GiftCardStatus } from "@/lib/gift-cards";
import { GiftCardModal } from "@/components/admin/gift-card-modal";
import { RedeemGiftCardModal } from "@/components/admin/redeem-gift-card-modal";

const statusStyles: Record<GiftCardStatus, string> = {
  pending: "bg-yellow-400/15 text-yellow-300",
  active: "bg-green-400/15 text-green-300",
  redeemed: "bg-white/10 text-white/50",
  cancelled: "bg-red-400/15 text-red-300",
};

const groupOrder: { key: "pending" | "declined" | "approved"; title: string; match: (status: GiftCardStatus) => boolean }[] = [
  { key: "pending", title: "Pending", match: (s) => s === "pending" },
  { key: "approved", title: "Approved", match: (s) => s === "active" || s === "redeemed" },
  { key: "declined", title: "Declined", match: (s) => s === "cancelled" },
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
  const [redeeming, setRedeeming] = useState<GiftCard | null>(null);

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
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
                  <>
                    <div className="space-y-3 lg:hidden">
                      {group.map((card) => (
                        <GiftCardCard
                          key={card.id}
                          card={card}
                          updating={updating === card.id}
                          onApprove={() => updateStatus(card.id, "active")}
                          onDecline={() => updateStatus(card.id, "cancelled")}
                          onRedeem={() => setRedeeming(card)}
                          onCancel={() => updateStatus(card.id, "cancelled")}
                        />
                      ))}
                    </div>

                    <div className="hidden overflow-x-auto rounded-2xl border border-white/10 bg-white/[.04] lg:block">
                      <table className="w-full min-w-[920px] text-left text-sm text-white">
                        <thead className="border-b border-white/10 bg-white/[.03] text-xs uppercase tracking-wider text-white/40">
                          <tr>
                            <th className="whitespace-nowrap px-5 py-4">Code</th>
                            <th className="whitespace-nowrap px-5 py-4">Balance</th>
                            <th className="whitespace-nowrap px-5 py-4">Recipient</th>
                            <th className="w-full px-5 py-4">Recipient Email</th>
                            <th className="whitespace-nowrap px-5 py-4">Purchaser</th>
                            <th className="whitespace-nowrap px-5 py-4">Status</th>
                            <th className="whitespace-nowrap px-5 py-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.map((card) => (
                            <tr key={card.id} className="border-b border-white/10 last:border-0">
                              <td className="whitespace-nowrap px-5 py-4 font-mono font-semibold">{card.code}</td>
                              <td className="whitespace-nowrap px-5 py-4">
                                £{card.balance.toFixed(2)}
                                {card.balance < card.value && (
                                  <span className="block text-xs text-white/40">of £{card.value.toFixed(2)}</span>
                                )}
                              </td>
                              <td className="max-w-[160px] truncate px-5 py-4">{card.recipientName}</td>
                              <td className="min-w-[200px] max-w-[260px] truncate px-5 py-4 text-white/70">{card.recipientEmail}</td>
                              <td className="max-w-[140px] truncate px-5 py-4 text-white/70">{card.purchaserName || "—"}</td>
                              <td className="whitespace-nowrap px-5 py-4">
                                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusStyles[card.status]}`}>
                                  {card.status}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                {card.status === "pending" && (
                                  <div className="flex gap-2 whitespace-nowrap">
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
                                  <div className="flex gap-2 whitespace-nowrap">
                                    <button
                                      disabled={updating === card.id}
                                      onClick={() => setRedeeming(card)}
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
                  </>
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
      {redeeming && (
        <RedeemGiftCardModal
          giftCard={redeeming}
          onClose={() => setRedeeming(null)}
          onRedeemed={() => {
            setRedeeming(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function GiftCardCard({
  card,
  updating,
  onApprove,
  onDecline,
  onRedeem,
  onCancel,
}: {
  card: GiftCard;
  updating: boolean;
  onApprove: () => void;
  onDecline: () => void;
  onRedeem: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono font-semibold text-white">{card.code}</p>
          <p className="truncate text-sm text-white">{card.recipientName}</p>
          <p className="truncate text-xs text-white/50">{card.recipientEmail}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase ${statusStyles[card.status]}`}>
          {card.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">Balance</p>
          <p className="text-white">
            £{card.balance.toFixed(2)}
            {card.balance < card.value && <span className="ml-1 text-xs text-white/40">of £{card.value.toFixed(2)}</span>}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">Purchaser</p>
          <p className="truncate text-white">{card.purchaserName || "—"}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-white/10 pt-3">
        {card.status === "pending" && (
          <div className="flex flex-wrap gap-2">
            <button
              disabled={updating}
              onClick={onApprove}
              className="rounded-full bg-green-600 px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-40"
            >
              Approve
            </button>
            <button
              disabled={updating}
              onClick={onDecline}
              className="rounded-full bg-brand-red px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-40"
            >
              Decline
            </button>
          </div>
        )}
        {card.status === "active" && (
          <div className="flex flex-wrap gap-2">
            <button
              disabled={updating}
              onClick={onRedeem}
              className="rounded-full bg-green-600 px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-40"
            >
              Redeem
            </button>
            <button
              disabled={updating}
              onClick={onCancel}
              className="rounded-full bg-brand-red px-3 py-2 text-xs font-bold uppercase text-white disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        )}
        {(card.status === "redeemed" || card.status === "cancelled") && (
          <span className="text-xs text-white/30">—</span>
        )}
      </div>
    </div>
  );
}
