"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Telescope, BookHeart, Clock } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  // Hide mobile nav on reader pages
  if (pathname?.startsWith("/read/")) return null;

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Explore", icon: Telescope },
    { href: "/library", label: "Library", icon: BookHeart },
    { href: "/history", label: "History", icon: Clock },
  ];

  return (
    <>
      <div className="md:hidden h-16 w-full shrink-0 bg-transparent pointer-events-none" />
      <nav 
        className="md:hidden fixed bottom-0 left-0 w-full z-50 h-16 bg-background border-t border-border-dark/10 flex items-center justify-around px-2 transition-colors duration-300"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
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
              <Icon className="h-5 w-5" strokeWidth={link.label === "Home" ? 2.5 : 2} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
