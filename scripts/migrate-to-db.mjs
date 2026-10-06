// One-off script to migrate local JSON seed data into Postgres.
// Usage: node scripts/migrate-to-db.mjs
import fs from "fs";
import path from "path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
});

async function main() {
  const schema = fs.readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf-8");
  await pool.query(schema);
  console.log("Schema ensured.");

  const bookings = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "bookings.json"), "utf-8")
  );
  for (const b of bookings) {
    await pool.query(
      `INSERT INTO bookings (id, name, email, phone, guests, date, time, notes, status, created_at, admin_notes, responded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [b.id, b.name, b.email, b.phone, b.guests, b.date, b.time, b.notes ?? null, b.status, b.createdAt, b.adminNotes ?? null, b.respondedAt ?? null]
    );
  }
  console.log(`Migrated ${bookings.length} bookings.`);

  const giftCards = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "gift-cards.json"), "utf-8")
  );
  for (const g of giftCards) {
    const balance = g.status === "redeemed" ? 0 : g.value;
    await pool.query(
      `INSERT INTO gift_cards (id, code, value, balance, recipient_name, recipient_email, purchaser_name, purchaser_email, message, status, created_at, redeemed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [g.id, g.code, g.value, balance, g.recipientName, g.recipientEmail, g.purchaserName ?? null, g.purchaserEmail ?? null, g.message ?? null, g.status, g.createdAt, g.redeemedAt ?? null]
    );
  }
  console.log(`Migrated ${giftCards.length} gift cards.`);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
