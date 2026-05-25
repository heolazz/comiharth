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
  const [isScrolled, setIsScrolled] = useState(false);

  // Prevent hydration warnings and handle scroll
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const isHomePage = pathname === "/";
  const isTransparent = isHomePage && !isScrolled;

  return (
    <>
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isTransparent 
          ? "bg-gradient-to-b from-white/95 via-white/70 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent border-transparent" 
          : "bg-background shadow-sm border-b border-border-dark/30"
      }`}>
        <div className="mx-auto flex max-w-[1400px] h-20 items-center justify-between px-4 md:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img src="/logo.png" alt="ComiHarth" className={`h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 dark:invert`} />
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex relative w-80">
            <input
              type="text"
              placeholder="Search manga, manhwa, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-10 rounded-full pl-10 pr-4 text-sm focus:outline-none focus:border-accent-green/70 focus:ring-1 focus:ring-accent-green/70 transition-all ${
                isTransparent 
                  ? "bg-black/5 border-black/10 text-black placeholder-black/60 focus:bg-white/50 dark:bg-white/10 dark:border-white/20 dark:text-white dark:placeholder-white/60 dark:focus:bg-black/40 backdrop-blur-md" 
                  : "bg-surface border-border-dark/70 text-foreground placeholder-muted-text/60"
              }`}
            />
            <Search className={`absolute left-3.5 top-3 h-4 w-4 ${isTransparent ? 'text-black/60 dark:text-white/60' : 'text-muted-text/60'}`} />
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
                        ? "text-accent-green drop-shadow-sm"
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
                className={`p-2 h-10 w-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isTransparent
                    ? "bg-black/5 border-black/10 text-black hover:bg-black/10 dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/20 backdrop-blur-md"
                    : "bg-surface border-border-dark/60 text-muted-text hover:text-accent-green hover:bg-surface-hover hover:border-accent-green/30"
                }`}
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
      {!isHomePage && <div className="h-20 w-full shrink-0" />}
    </>
  );
}
