import { redirect } from "next/navigation";
import { getSessionToken, isValidSession } from "@/lib/auth";
import { getGiftCards } from "@/lib/gift-cards";
import { GiftCardsTable } from "@/components/admin/gift-cards-table";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminFooter } from "@/components/admin/admin-footer";

export const metadata = { title: "Admin — Gift Cards" };
export const dynamic = "force-dynamic";

export default async function AdminGiftCards() {
  const token = await getSessionToken();
  if (!(await isValidSession(token))) {
    redirect("/admin/login");
  }

  const giftCards = await getGiftCards();
  const pendingCount = giftCards.filter((g) => g.status === "pending").length;

  return (
    <main className="flex min-h-screen flex-col bg-black">
      <AdminHeader />
      <div className="w-full flex-1 px-10 py-12">
        <GiftCardsTable giftCards={giftCards} />
      </div>
      <AdminFooter title="Gift Cards" pendingLabel="pending" pendingCount={pendingCount} totalCount={giftCards.length} />
    </main>
  );
}
