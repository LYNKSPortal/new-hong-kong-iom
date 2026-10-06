import crypto from "crypto";
import { pool } from "@/lib/db";

export type BookingStatus = "pending" | "approved" | "declined";

export type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  adminNotes?: string;
  respondedAt?: string;
};

type BookingRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  notes: string | null;
  status: BookingStatus;
  created_at: Date;
  admin_notes: string | null;
  responded_at: Date | null;
};

function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    guests: row.guests,
    date: row.date,
    time: row.time,
    notes: row.notes ?? undefined,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    adminNotes: row.admin_notes ?? undefined,
    respondedAt: row.responded_at ? row.responded_at.toISOString() : undefined,
  };
}

export async function getBookings(): Promise<Booking[]> {
  const { rows } = await pool.query<BookingRow>(
    "SELECT * FROM bookings ORDER BY created_at DESC"
  );
  return rows.map(rowToBooking);
}

export async function addBooking(
  input: Omit<Booking, "id" | "status" | "createdAt">
): Promise<Booking> {
  const { rows } = await pool.query<BookingRow>(
    `INSERT INTO bookings (id, name, email, phone, guests, date, time, notes, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', now())
     RETURNING *`,
    [crypto.randomUUID(), input.name, input.email, input.phone, input.guests, input.date, input.time, input.notes ?? null]
  );
  return rowToBooking(rows[0]);
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  adminNotes?: string
): Promise<Booking | null> {
  const { rows } = await pool.query<BookingRow>(
    `UPDATE bookings
     SET status = $2,
         admin_notes = COALESCE($3, admin_notes),
         responded_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, status, adminNotes ?? null]
  );
  return rows[0] ? rowToBooking(rows[0]) : null;
}
