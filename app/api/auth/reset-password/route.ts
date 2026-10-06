import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken, PasswordResetError } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400 }
    );
  }

  try {
    await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof PasswordResetError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
