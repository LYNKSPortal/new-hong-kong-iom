import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "nhk_admin_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type Session = { token: string; createdAt: number };

const sessionsPath = path.join(process.cwd(), "data", "sessions.json");

function readSessions(): Session[] {
  try {
    return JSON.parse(fs.readFileSync(sessionsPath, "utf-8")) as Session[];
  } catch {
    return [];
  }
}

function writeSessions(sessions: Session[]) {
  fs.mkdirSync(path.dirname(sessionsPath), { recursive: true });
  fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2));
}

export function verifyCredentials(username: string, password: string): boolean {
  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;
  if (!validUser || !validPass) return false;
  return username === validUser && password === validPass;
}

export function createSession(): string {
  const token = crypto.randomBytes(32).toString("hex");
  const sessions = readSessions().filter((s) => Date.now() - s.createdAt < SESSION_TTL_MS);
  sessions.push({ token, createdAt: Date.now() });
  writeSessions(sessions);
  return token;
}

export function destroySession(token: string) {
  const sessions = readSessions().filter((s) => s.token !== token);
  writeSessions(sessions);
}

export function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const session = readSessions().find((s) => s.token === token);
  if (!session) return false;
  return Date.now() - session.createdAt < SESSION_TTL_MS;
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}
