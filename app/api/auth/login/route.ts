import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, SESSION_TTL_MS, createSession, verifyCredentials } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const user = await verifyCredentials(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const token = await createSession(user.id);
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
  return res;
}
