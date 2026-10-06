import { Resend } from "resend";
import type { Booking, BookingStatus } from "@/lib/bookings";
import type { GiftCard } from "@/lib/gift-cards";
import { restaurant } from "@/data/site";

const FROM = process.env.EMAIL_FROM || "New Hong Kong <bookings@newhongkong.co.im>";
const NOTIFICATION_EMAIL = process.env.RESTAURANT_NOTIFICATION_EMAIL;

let client: Resend | null = null;
function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

async function send(to: string, subject: string, html: string) {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email to ${to}: ${subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
  }
}

const statusCopy: Record<BookingStatus, { heading: string; body: string }> = {
  pending: {
    heading: "We've received your booking request",
    body: "Thanks for booking with us. We'll confirm your table shortly.",
  },
  approved: {
    heading: "Your booking is confirmed!",
    body: "We're looking forward to welcoming you.",
  },
  declined: {
    heading: "We're unable to confirm your booking",
    body: "Unfortunately we couldn't accommodate this booking. Please get in touch to find another time.",
  },
};

export async function sendBookingReceivedEmail(booking: Booking) {
  await send(
    booking.email,
    `${restaurant.name} — Booking received`,
    `<p>Hi ${booking.name},</p>
     <p>${statusCopy.pending.body}</p>
     <p><strong>Date:</strong> ${booking.date}<br/>
     <strong>Time:</strong> ${booking.time}<br/>
     <strong>Guests:</strong> ${booking.guests}</p>
     <p>${restaurant.name}<br/>${restaurant.phone}</p>`
  );

  if (NOTIFICATION_EMAIL) {
    await send(
      NOTIFICATION_EMAIL,
      `New booking request — ${booking.name}`,
      `<p>New booking request:</p>
       <p><strong>Name:</strong> ${booking.name}<br/>
       <strong>Email:</strong> ${booking.email}<br/>
       <strong>Phone:</strong> ${booking.phone}<br/>
       <strong>Date:</strong> ${booking.date}<br/>
       <strong>Time:</strong> ${booking.time}<br/>
       <strong>Guests:</strong> ${booking.guests}${booking.notes ? `<br/><strong>Notes:</strong> ${booking.notes}` : ""}</p>`
    );
  }
}

export async function sendBookingStatusEmail(booking: Booking) {
  const copy = statusCopy[booking.status];
  await send(
    booking.email,
    `${restaurant.name} — ${copy.heading}`,
    `<p>Hi ${booking.name},</p>
     <p>${copy.body}</p>
     <p><strong>Date:</strong> ${booking.date}<br/>
     <strong>Time:</strong> ${booking.time}<br/>
     <strong>Guests:</strong> ${booking.guests}</p>
     ${booking.adminNotes ? `<p><strong>Note from us:</strong> ${booking.adminNotes}</p>` : ""}
     <p>${restaurant.name}<br/>${restaurant.phone}</p>`
  );
}

async function sendGiftCardCodeEmail(giftCard: GiftCard) {
  await send(
    giftCard.recipientEmail,
    `You've received a ${restaurant.name} gift card!`,
    `<p>Hi ${giftCard.recipientName},</p>
     ${giftCard.purchaserName ? `<p>${giftCard.purchaserName} has sent you a gift card for ${restaurant.name}.</p>` : `<p>You've received a gift card for ${restaurant.name}.</p>`}
     ${giftCard.message ? `<p><em>"${giftCard.message}"</em></p>` : ""}
     <p><strong>Value:</strong> £${giftCard.value}<br/>
     <strong>Code:</strong> ${giftCard.code}</p>
     <p>Present this code when you visit us. Enjoy!</p>
     <p>${restaurant.name}<br/>${restaurant.phone}</p>`
  );

  if (giftCard.purchaserEmail) {
    await send(
      giftCard.purchaserEmail,
      `Your ${restaurant.name} gift card purchase is confirmed`,
      `<p>Thanks for your gift card purchase — it's confirmed!</p>
       <p><strong>Recipient:</strong> ${giftCard.recipientName}<br/>
       <strong>Value:</strong> £${giftCard.value}<br/>
       <strong>Code:</strong> ${giftCard.code}</p>
       <p>${restaurant.name}<br/>${restaurant.phone}</p>`
    );
  }
}

export async function sendGiftCardReceivedEmail(giftCard: GiftCard) {
  if (giftCard.status === "pending") {
    // Public purchase request awaiting admin approval — don't hand out the code yet.
    const recipient = giftCard.purchaserEmail || giftCard.recipientEmail;
    await send(
      recipient,
      `${restaurant.name} — Gift card request received`,
      `<p>Thanks for your gift card request. We'll confirm it shortly.</p>
       <p><strong>Recipient:</strong> ${giftCard.recipientName}<br/>
       <strong>Value:</strong> £${giftCard.value}</p>
       <p>${restaurant.name}<br/>${restaurant.phone}</p>`
    );
  } else {
    // Created directly by an admin — already active, send the code now.
    await sendGiftCardCodeEmail(giftCard);
  }

  if (NOTIFICATION_EMAIL) {
    await send(
      NOTIFICATION_EMAIL,
      `New gift card ${giftCard.status === "pending" ? "request" : "purchase"} — £${giftCard.value}`,
      `<p>New gift card ${giftCard.status === "pending" ? "request" : "purchase"}:</p>
       <p><strong>Recipient:</strong> ${giftCard.recipientName} (${giftCard.recipientEmail})<br/>
       <strong>Purchaser:</strong> ${giftCard.purchaserName ?? "—"} ${giftCard.purchaserEmail ? `(${giftCard.purchaserEmail})` : ""}<br/>
       <strong>Value:</strong> £${giftCard.value}<br/>
       <strong>Code:</strong> ${giftCard.code}</p>`
    );
  }
}

export async function sendGiftCardStatusEmail(giftCard: GiftCard) {
  if (giftCard.status === "active") {
    // Approved from a pending request — this is the first time the code goes out.
    await sendGiftCardCodeEmail(giftCard);
    return;
  }

  if (giftCard.status === "cancelled") {
    const recipient = giftCard.purchaserEmail || giftCard.recipientEmail;
    await send(
      recipient,
      `${restaurant.name} — Gift card request declined`,
      `<p>Unfortunately we're unable to confirm this gift card request.</p>
       <p><strong>Recipient:</strong> ${giftCard.recipientName}<br/>
       <strong>Value:</strong> £${giftCard.value}</p>
       <p>Please get in touch if you have any questions.</p>
       <p>${restaurant.name}<br/>${restaurant.phone}</p>`
    );
    return;
  }

}

export async function sendGiftCardRedemptionEmail(giftCard: GiftCard, amountRedeemed: number) {
  const fullyRedeemed = giftCard.status === "redeemed";
  await send(
    giftCard.recipientEmail,
    `${restaurant.name} — Gift card ${fullyRedeemed ? "fully redeemed" : "redemption"}`,
    `<p>Hi ${giftCard.recipientName},</p>
     <p>£${amountRedeemed.toFixed(2)} was redeemed from your gift card (code ${giftCard.code}).</p>
     ${fullyRedeemed
      ? "<p>The full balance has now been used. Thanks for visiting us!</p>"
      : `<p><strong>Remaining balance:</strong> £${giftCard.balance.toFixed(2)}</p>`}
     <p>${restaurant.name}<br/>${restaurant.phone}</p>`
  );

  if (NOTIFICATION_EMAIL) {
    await send(
      NOTIFICATION_EMAIL,
      `Gift card redemption — ${giftCard.code}`,
      `<p><strong>Code:</strong> ${giftCard.code}<br/>
       <strong>Recipient:</strong> ${giftCard.recipientName}<br/>
       <strong>Amount redeemed:</strong> £${amountRedeemed.toFixed(2)}<br/>
       <strong>Remaining balance:</strong> £${giftCard.balance.toFixed(2)}<br/>
       <strong>Status:</strong> ${giftCard.status}</p>`
    );
  }
}

export async function sendAdminPasswordResetEmail(email: string, resetUrl: string) {
  await send(
    email,
    `${restaurant.name} Admin — Reset your password`,
    `<p>We received a request to reset the password for your admin account.</p>
     <p><a href="${resetUrl}" style="display:inline-block;background:#D8232A;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold;">Reset password</a></p>
     <p>Or copy this link into your browser:<br/>${resetUrl}</p>
     <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
     <p>${restaurant.name}</p>`
  );
}
