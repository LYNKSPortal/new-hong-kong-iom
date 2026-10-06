import crypto from "crypto";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";

export const COOKIE_NAME = "nhk_admin_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
export const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

type AdminUserRow = {
  id: string;
  email: string;
  password_hash: string;
};

export type AdminUser = { id: string; email: string };

function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hashHex) return Promise.resolve(false);
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      const stored = Buffer.from(hashHex, "hex");
      resolve(stored.length === derivedKey.length && crypto.timingSafeEqual(stored, derivedKey));
    });
  });
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function setAdminPassword(email: string, password: string): Promise<AdminUser> {
  const passwordHash = await hashPassword(password);
  const { rows } = await pool.query<AdminUserRow>(
    `INSERT INTO admin_users (id, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = $3, updated_at = now()
     RETURNING id, email, password_hash`,
    [crypto.randomUUID(), email.toLowerCase(), passwordHash]
  );
  return { id: rows[0].id, email: rows[0].email };
}

export async function verifyCredentials(email: string, password: string): Promise<AdminUser | null> {
  const { rows } = await pool.query<AdminUserRow>(
    "SELECT id, email, password_hash FROM admin_users WHERE email = $1",
    [email.toLowerCase()]
  );
  const user = rows[0];
  if (!user) return null;
  const valid = await verifyPassword(password, user.password_hash);
  return valid ? { id: user.id, email: user.email } : null;
}

export async function createSession(adminUserId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  await pool.query("INSERT INTO admin_sessions (token, admin_user_id) VALUES ($1, $2)", [token, adminUserId]);
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await pool.query("DELETE FROM admin_sessions WHERE token = $1", [token]);
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const { rows } = await pool.query<{ created_at: Date }>(
    "SELECT created_at FROM admin_sessions WHERE token = $1",
    [token]
  );
  const session = rows[0];
  if (!session) return false;
  if (Date.now() - session.created_at.getTime() > SESSION_TTL_MS) {
    await destroySession(token);
    return false;
  }
  return true;
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

/**
 * Creates a password reset token for the given email, if an admin account exists for it.
 * Returns the plaintext token to embed in the reset link, or null if no account matches
 * (callers should still respond generically either way, to avoid leaking account existence).
 */
export async function createPasswordResetToken(email: string): Promise<string | null> {
  const { rows } = await pool.query<{ id: string }>(
    "SELECT id FROM admin_users WHERE email = $1",
    [email.toLowerCase()]
  );
  const user = rows[0];
  if (!user) return null;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await pool.query(
    `INSERT INTO admin_password_resets (id, admin_user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [crypto.randomUUID(), user.id, hashToken(token), expiresAt]
  );
  return token;
}

export class PasswordResetError extends Error {}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(token);
  const { rows } = await pool.query<{ id: string; admin_user_id: string; expires_at: Date; used_at: Date | null }>(
    "SELECT id, admin_user_id, expires_at, used_at FROM admin_password_resets WHERE token_hash = $1",
    [tokenHash]
  );
  const reset = rows[0];
  if (!reset) throw new PasswordResetError("This reset link is invalid.");
  if (reset.used_at) throw new PasswordResetError("This reset link has already been used.");
  if (reset.expires_at.getTime() < Date.now()) throw new PasswordResetError("This reset link has expired.");

  const passwordHash = await hashPassword(newPassword);
  await pool.query("UPDATE admin_users SET password_hash = $2, updated_at = now() WHERE id = $1", [
    reset.admin_user_id,
    passwordHash,
  ]);
  await pool.query("UPDATE admin_password_resets SET used_at = now() WHERE id = $1", [reset.id]);
  // Invalidate all existing sessions for this admin so old logins don't persist past a reset.
  await pool.query("DELETE FROM admin_sessions WHERE admin_user_id = $1", [reset.admin_user_id]);
}
