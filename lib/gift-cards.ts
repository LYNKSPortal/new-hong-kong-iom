import fs from "fs";
import path from "path";
import crypto from "crypto";

export type GiftCardStatus = "pending" | "active" | "redeemed" | "cancelled";

export type GiftCard = {
  id: string;
  code: string;
  value: number;
  recipientName: string;
  recipientEmail: string;
  purchaserName?: string;
  purchaserEmail?: string;
  message?: string;
  status: GiftCardStatus;
  createdAt: string;
  redeemedAt?: string;
};

const filePath = path.join(process.cwd(), "data", "gift-cards.json");

function readAll(): GiftCard[] {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as GiftCard[];
  } catch {
    return [];
  }
}

function writeAll(giftCards: GiftCard[]) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(giftCards, null, 2));
}

function generateCode(): string {
  const segment = () => crypto.randomBytes(2).toString("hex").toUpperCase();
  return `NHK-${segment()}-${segment()}`;
}

export function getGiftCards(): GiftCard[] {
  return readAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addGiftCard(
  input: Omit<GiftCard, "id" | "code" | "status" | "createdAt" | "redeemedAt">,
  status: GiftCardStatus = "pending"
): GiftCard {
  const giftCards = readAll();
  const giftCard: GiftCard = {
    ...input,
    id: crypto.randomUUID(),
    code: generateCode(),
    status,
    createdAt: new Date().toISOString(),
  };
  giftCards.push(giftCard);
  writeAll(giftCards);
  return giftCard;
}

export function updateGiftCardStatus(id: string, status: GiftCardStatus): GiftCard | null {
  const giftCards = readAll();
  const index = giftCards.findIndex((g) => g.id === id);
  if (index === -1) return null;
  giftCards[index] = {
    ...giftCards[index],
    status,
    redeemedAt: status === "redeemed" ? new Date().toISOString() : giftCards[index].redeemedAt,
  };
  writeAll(giftCards);
  return giftCards[index];
}
