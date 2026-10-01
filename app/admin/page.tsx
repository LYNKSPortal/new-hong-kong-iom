import { redirect } from "next/navigation";
import { getSessionToken, isValidSession } from "@/lib/auth";
import { getBookings } from "@/lib/bookings";
import { BookingsTable } from "@/components/admin/bookings-table";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminFooter } from "@/components/admin/admin-footer";

export const metadata = { title: "Admin — Bookings" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const token = await getSessionToken();
  if (!isValidSession(token)) {
    redirect("/admin/login");
  }

  const bookings = getBookings();
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <main className="flex min-h-screen flex-col bg-black">
      <AdminHeader />
      <div className="w-full flex-1 px-10 py-12">
        <BookingsTable bookings={bookings} />
      </div>
      <AdminFooter pendingCount={pendingCount} totalCount={bookings.length} />
    </main>
  );
}
