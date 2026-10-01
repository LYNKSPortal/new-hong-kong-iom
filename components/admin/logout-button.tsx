"use client";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20"
    >
      <Lock size={14} />
      Log out
    </button>
  );
}
