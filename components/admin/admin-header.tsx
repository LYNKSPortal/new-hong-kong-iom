"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/admin/logout-button";

const adminNav = [
  { href: "/admin", label: "Bookings" },
  { href: "/admin/gift-cards", label: "Gift Cards" },
];

export function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-brand-charcoal">
      <div className="flex w-full items-center justify-between gap-4 px-10 py-6">
        <Link href="/admin" aria-label="New Hong Kong admin home">
          <Image src="/logo-light.png" alt="New Hong Kong Asian Food Bar" width={1000} height={180} priority className="h-auto w-[300px]" />
        </Link>
        <nav className="flex items-center gap-6" aria-label="Admin navigation">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-xs font-bold uppercase tracking-wider ${
                pathname === item.href ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="mailto:support@newhongkong.im"
            className="text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white"
          >
            Contact Support
          </a>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
