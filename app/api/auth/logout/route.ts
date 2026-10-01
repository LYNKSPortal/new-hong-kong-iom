import { NextResponse } from "next/server";
import { COOKIE_NAME, destroySession, getSessionToken } from "@/lib/auth";

export async function POST() {
  const token = await getSessionToken();
  if (token) destroySession(token);
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
