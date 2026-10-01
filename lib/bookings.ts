import fs from "fs";
import path from "path";
import crypto from "crypto";

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

const filePath = path.join(process.cwd(), "data", "bookings.json");

function readAll(): Booking[] {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Booking[];
  } catch {
    return [];
  }
}

function writeAll(bookings: Booking[]) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(bookings, null, 2));
}

export function getBookings(): Booking[] {
  return readAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addBooking(input: Omit<Booking, "id" | "status" | "createdAt">): Booking {
  const bookings = readAll();
  const booking: Booking = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  writeAll(bookings);
  return booking;
}

export function updateBookingStatus(id: string, status: BookingStatus, adminNotes?: string): Booking | null {
  const bookings = readAll();
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;
  bookings[index] = {
    ...bookings[index],
    status,
    adminNotes: adminNotes !== undefined ? adminNotes : bookings[index].adminNotes,
    respondedAt: new Date().toISOString(),
  };
  writeAll(bookings);
  return bookings[index];
}
