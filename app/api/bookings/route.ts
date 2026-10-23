import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addBooking, getBookings } from "@/lib/bookings";
import { getSessionToken, isValidSession } from "@/lib/auth";
import { sendBookingReceivedEmail } from "@/lib/email";
import { getAvailableTimeSlots } from "@/data/site";

const schema = z
  .object({
    guests: z.coerce.number().min(1).max(6),
    date: z.string().min(1),
    time: z.string().min(1),
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
    notes: z.string().max(500).optional(),
  })
  .superRefine((values, ctx) => {
    const dayOfWeek = new Date(`${values.date}T12:00:00`).getDay();
    if (Number.isNaN(dayOfWeek)) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Invalid date" });
      return;
    }
    const availableTimes = getAvailableTimeSlots(dayOfWeek);
    if (availableTimes.length === 0) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "We are closed on that day" });
    } else if (!availableTimes.includes(values.time)) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "That time is outside our opening hours" });
    }
  });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking details" }, { status: 400 });
  }
  const booking = await addBooking(parsed.data);
  await sendBookingReceivedEmail(booking);
  return NextResponse.json({ booking }, { status: 201 });
}

export async function GET() {
  const token = await getSessionToken();
  if (!(await isValidSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ bookings: await getBookings() });
}
