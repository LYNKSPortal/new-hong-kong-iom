import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addBooking, getBookings } from "@/lib/bookings";
import { getSessionToken, isValidSession } from "@/lib/auth";

const schema = z.object({
  guests: z.coerce.number().min(1).max(20),
  date: z.string().min(1),
  time: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details" }, { status: 400 });
  }
  const booking = addBooking(parsed.data);
  return NextResponse.json({ booking }, { status: 201 });
}

export async function GET() {
  const token = await getSessionToken();
  if (!isValidSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ bookings: getBookings() });
}
