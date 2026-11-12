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
      <div className="flex w-full flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between md:gap-4 md:px-10 md:py-6">
        <div className="flex items-center justify-between gap-4 md:justify-start">
          <Link href="/admin" aria-label="New Hong Kong admin home" className="shrink-0">
            <Image
              src="/logo-light.png"
              alt="New Hong Kong Asian Food Bar"
              width={1000}
              height={180}
              priority
              className="h-auto w-[160px] sm:w-[220px] md:w-[260px] lg:w-[300px]"
            />
          </Link>
          <div className="md:hidden">
            <LogoutButton />
          </div>
        </div>
        <nav className="flex items-center gap-4 overflow-x-auto sm:gap-6" aria-label="Admin navigation">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 text-xs font-bold uppercase tracking-wider ${
                pathname === item.href ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-3 md:justify-end">
          <a
            href="mailto:support@newhongkong.im"
            className="text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white"
          >
            Contact Support
          </a>
          <div className="hidden md:block">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
