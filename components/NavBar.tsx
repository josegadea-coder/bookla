"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Equipment" },
  { href: "/my-bookings", label: "My Bookings" },
  { href: "/admin", label: "Admin" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg tracking-tight text-ink shrink-0 focus-ring rounded"
        >
          <span className="w-6 h-6 rounded-md bg-teal flex items-center justify-center text-white text-xs font-bold">
            B
          </span>
          Bookin
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-control text-sm font-medium whitespace-nowrap transition-colors focus-ring ${
                  isActive
                    ? "bg-teal-soft text-teal"
                    : "text-ink-soft hover:text-ink hover:bg-bg"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
