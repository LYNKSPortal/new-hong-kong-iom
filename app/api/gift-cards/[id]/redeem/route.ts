import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { redeemGiftCardAmount, RedemptionError, GiftCardNotFoundError } from "@/lib/gift-cards";
import { getSessionToken, isValidSession } from "@/lib/auth";
import { sendGiftCardRedemptionEmail } from "@/lib/email";

const schema = z.object({
  amount: z.coerce.number().positive(),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!(await isValidSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid redemption details" }, { status: 400 });
  }

  try {
    const { giftCard, amountRedeemed } = await redeemGiftCardAmount(id, parsed.data.amount, parsed.data.note);
    await sendGiftCardRedemptionEmail(giftCard, amountRedeemed);
    return NextResponse.json({ giftCard });
  } catch (err) {
    if (err instanceof GiftCardNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof RedemptionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
