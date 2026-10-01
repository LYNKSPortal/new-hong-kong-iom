import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, SESSION_TTL_MS, createSession, verifyCredentials } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (typeof username !== "string" || typeof password !== "string" || !verifyCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }
  const token = createSession();
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
