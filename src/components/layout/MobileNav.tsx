"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, History } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/library", label: "Library", icon: Bookmark },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-50 h-16 rounded-2xl glass border border-white/5 shadow-2xl flex items-center justify-around px-4">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 p-2 text-xs font-semibold transition-all ${
              isActive
                ? "text-accent-green scale-105"
                : "text-muted-text hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
