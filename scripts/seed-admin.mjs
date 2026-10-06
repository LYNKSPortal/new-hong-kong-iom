// One-off script to create/reset the initial admin user with a random (unknown) password,
// so the only way to get in is via the "forgot password" email flow.
// Usage: node scripts/seed-admin.mjs <email>
import crypto from "crypto";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/seed-admin.mjs <email>");
  process.exit(1);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
});

async function main() {
  const randomPassword = crypto.randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(randomPassword);
  await pool.query(
    `INSERT INTO admin_users (id, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = $3, updated_at = now()`,
    [crypto.randomUUID(), email.toLowerCase(), passwordHash]
  );
  console.log(`Admin user ensured for ${email} with a random (unknown) password.`);
  console.log("Use the 'Forgot password' flow on /admin/login to set a real password.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
