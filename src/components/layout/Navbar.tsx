"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Search, Bookmark, History, Home, Flame, Sun, Moon, Compass } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration warnings
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide global navbar on reader pages
  if (pathname?.startsWith("/read/")) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Explore", icon: Compass },
    { href: "/library", label: "Library", icon: Bookmark },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background transition-colors duration-300">
      <div className="mx-auto flex max-w-[1400px] h-20 items-center justify-between px-4 md:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <img src="/logo.png" alt="ComiHarth" className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 dark:invert" />
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex relative w-80">
          <input
            type="text"
            placeholder="Search manga, manhwa, genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-full bg-surface border border-border-dark/70 pl-10 pr-4 text-sm text-foreground placeholder-muted-text/60 focus:outline-none focus:border-accent-green/70 focus:ring-1 focus:ring-accent-green/70 transition-all"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-text/60" />
        </form>

        {/* Action Panel */}
        <div className="flex items-center gap-4">
          
          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-accent-green"
                      : "text-muted-text hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggler Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 h-10 w-10 rounded-full border border-border-dark/60 bg-surface hover:bg-surface-hover hover:border-accent-green/30 text-muted-text hover:text-accent-green flex items-center justify-center transition-all cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          )}

          {/* Mobile Search Button */}
          <div className="flex md:hidden items-center">
            <Link
              href="/search"
              className="p-2 text-muted-text hover:text-foreground rounded-lg transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>
          </div>

        </div>

      </div>
    </header>
  );
}
