import { NextRequest, NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/bookings";
import { getSessionToken, isValidSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!isValidSession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { status, note } = await req.json();
  if (!["pending", "approved", "declined"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const booking = updateBookingStatus(id, status, typeof note === "string" ? note : undefined);
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  console.log(
    `[notify] Would email ${booking.email} — booking ${status}.${booking.adminNotes ? ` Note: ${booking.adminNotes}` : ""}`
  );
  return NextResponse.json({ booking });
}
