import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addGiftCard, getGiftCards } from "@/lib/gift-cards";
import { getSessionToken, isValidSession } from "@/lib/auth";
import { sendGiftCardReceivedEmail } from "@/lib/email";

const schema = z.object({
  value: z.coerce.number().min(1).max(1000),
  recipientName: z.string().min(2),
  recipientEmail: z.string().email(),
  purchaserName: z.string().max(120).optional(),
  purchaserEmail: z.string().email().optional().or(z.literal("")),
  message: z.string().max(500).optional(),
});

export async function GET() {
  const token = await getSessionToken();
  if (!(await isValidSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ giftCards: await getGiftCards() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid gift card details" }, { status: 400 });
  }
  const token = await getSessionToken();
  const isAdmin = await isValidSession(token);
  const { purchaserEmail, ...rest } = parsed.data;
  const giftCard = await addGiftCard({ ...rest, purchaserEmail: purchaserEmail || undefined }, isAdmin ? "active" : "pending");
  await sendGiftCardReceivedEmail(giftCard);
  return NextResponse.json({ giftCard }, { status: 201 });
}
