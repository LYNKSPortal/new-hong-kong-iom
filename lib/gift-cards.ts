import crypto from "crypto";
import { pool } from "@/lib/db";

export type GiftCardStatus = "pending" | "active" | "redeemed" | "cancelled";

export type GiftCard = {
  id: string;
  code: string;
  value: number;
  balance: number;
  recipientName: string;
  recipientEmail: string;
  purchaserName?: string;
  purchaserEmail?: string;
  message?: string;
  status: GiftCardStatus;
  createdAt: string;
  redeemedAt?: string;
};

type GiftCardRow = {
  id: string;
  code: string;
  value: string;
  balance: string;
  recipient_name: string;
  recipient_email: string;
  purchaser_name: string | null;
  purchaser_email: string | null;
  message: string | null;
  status: GiftCardStatus;
  created_at: Date;
  redeemed_at: Date | null;
};

function rowToGiftCard(row: GiftCardRow): GiftCard {
  return {
    id: row.id,
    code: row.code,
    value: Number(row.value),
    balance: Number(row.balance),
    recipientName: row.recipient_name,
    recipientEmail: row.recipient_email,
    purchaserName: row.purchaser_name ?? undefined,
    purchaserEmail: row.purchaser_email ?? undefined,
    message: row.message ?? undefined,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    redeemedAt: row.redeemed_at ? row.redeemed_at.toISOString() : undefined,
  };
}

function generateCode(): string {
  const segment = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `NHK-${segment()}-${segment()}`;
}

export async function getGiftCards(): Promise<GiftCard[]> {
  const { rows } = await pool.query<GiftCardRow>(
    "SELECT * FROM gift_cards ORDER BY created_at DESC"
  );
  return rows.map(rowToGiftCard);
}

export async function getGiftCard(id: string): Promise<GiftCard | null> {
  const { rows } = await pool.query<GiftCardRow>("SELECT * FROM gift_cards WHERE id = $1", [id]);
  return rows[0] ? rowToGiftCard(rows[0]) : null;
}

export async function addGiftCard(
  input: Omit<GiftCard, "id" | "code" | "balance" | "status" | "createdAt" | "redeemedAt">,
  status: GiftCardStatus = "pending"
): Promise<GiftCard> {
  const { rows } = await pool.query<GiftCardRow>(
    `INSERT INTO gift_cards (id, code, value, balance, recipient_name, recipient_email, purchaser_name, purchaser_email, message, status, created_at)
     VALUES ($1, $2, $3, $3, $4, $5, $6, $7, $8, $9, now())
     RETURNING *`,
    [
      crypto.randomUUID(),
      generateCode(),
      input.value,
      input.recipientName,
      input.recipientEmail,
      input.purchaserName ?? null,
      input.purchaserEmail ?? null,
      input.message ?? null,
      status,
    ]
  );
  return rowToGiftCard(rows[0]);
}

export async function updateGiftCardStatus(
  id: string,
  status: Extract<GiftCardStatus, "active" | "cancelled">
): Promise<GiftCard | null> {
  const { rows } = await pool.query<GiftCardRow>(
    `UPDATE gift_cards
     SET status = $2
     WHERE id = $1
     RETURNING *`,
    [id, status]
  );
  return rows[0] ? rowToGiftCard(rows[0]) : null;
}

export class RedemptionError extends Error {}
export class GiftCardNotFoundError extends RedemptionError {}

export async function redeemGiftCardAmount(
  id: string,
  amount: number,
  note?: string
): Promise<{ giftCard: GiftCard; amountRedeemed: number }> {
  if (!(amount > 0)) {
    throw new RedemptionError("Redemption amount must be greater than zero.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<GiftCardRow>(
      "SELECT * FROM gift_cards WHERE id = $1 FOR UPDATE",
      [id]
    );
    const current = rows[0] ? rowToGiftCard(rows[0]) : null;
    if (!current) {
      throw new GiftCardNotFoundError("Gift card not found.");
    }
    if (current.status !== "active") {
      throw new RedemptionError(`Gift card is ${current.status} and cannot be redeemed.`);
    }
    if (amount > current.balance) {
      throw new RedemptionError(`Redemption amount exceeds remaining balance of £${current.balance.toFixed(2)}.`);
    }

    const newBalance = Math.round((current.balance - amount) * 100) / 100;
    const newStatus: GiftCardStatus = newBalance <= 0 ? "redeemed" : "active";

    const { rows: updatedRows } = await client.query<GiftCardRow>(
      `UPDATE gift_cards
       SET balance = $2,
           status = $3,
           redeemed_at = CASE WHEN $3 = 'redeemed' THEN now() ELSE redeemed_at END
       WHERE id = $1
       RETURNING *`,
      [id, newBalance, newStatus]
    );

    await client.query(
      `INSERT INTO gift_card_redemptions (id, gift_card_id, amount, note)
       VALUES ($1, $2, $3, $4)`,
      [crypto.randomUUID(), id, amount, note ?? null]
    );

    await client.query("COMMIT");
    return { giftCard: rowToGiftCard(updatedRows[0]), amountRedeemed: amount };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export type GiftCardRedemption = {
  id: string;
  giftCardId: string;
  amount: number;
  note?: string;
  redeemedAt: string;
};

export async function getGiftCardRedemptions(giftCardId: string): Promise<GiftCardRedemption[]> {
  const { rows } = await pool.query<{
    id: string;
    gift_card_id: string;
    amount: string;
    note: string | null;
    redeemed_at: Date;
  }>(
    "SELECT * FROM gift_card_redemptions WHERE gift_card_id = $1 ORDER BY redeemed_at DESC",
    [giftCardId]
  );
  return rows.map((r) => ({
    id: r.id,
    giftCardId: r.gift_card_id,
    amount: Number(r.amount),
    note: r.note ?? undefined,
    redeemedAt: r.redeemed_at.toISOString(),
  }));
}
