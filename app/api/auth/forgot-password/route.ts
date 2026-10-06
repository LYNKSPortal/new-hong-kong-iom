import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth";
import { sendAdminPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (typeof email !== "string" || !email) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const token = await createPasswordResetToken(email);
  if (token) {
    const origin = req.headers.get("origin") || new URL(req.url).origin;
    const resetUrl = `${origin}/admin/reset-password?token=${token}`;
    await sendAdminPasswordResetEmail(email, resetUrl);
  }

  // Always respond the same way, whether or not the email matched an account,
  // so we don't leak which addresses have admin access.
  return NextResponse.json({ success: true });
}
