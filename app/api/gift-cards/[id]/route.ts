import { NextRequest, NextResponse } from "next/server";
import { updateGiftCardStatus } from "@/lib/gift-cards";
import { getSessionToken, isValidSession } from "@/lib/auth";
import { sendGiftCardStatusEmail } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!(await isValidSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { status } = await req.json();
  if (!["active", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const giftCard = await updateGiftCardStatus(id, status);
  if (!giftCard) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await sendGiftCardStatusEmail(giftCard);
  return NextResponse.json({ giftCard });
}
