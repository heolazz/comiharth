"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Search, Bookmark, History, Home, Flame, Sun, Moon, Compass, Database, ChevronDown } from "lucide-react";

type ComicSource = "shinigami" | "komikcast";

const sources: { label: string; value: ComicSource }[] = [
  { label: "Shinigami", value: "shinigami" },
  // { label: "Komikcast (Lambat)", value: "komikcast" }, // Disembunyikan sementara karena API lambat
];

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Source Switcher State
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const querySource = (searchParams.get("source") || searchParams.get("provider")) as ComicSource;
  // Force shinigami since komikcast is hidden/slow
  let currentSource = querySource || (typeof window !== "undefined" ? (localStorage.getItem("comic-source") as ComicSource) || "shinigami" : "shinigami");
  if (currentSource === "komikcast") currentSource = "shinigami";
  const currentLabel = sources.find((item) => item.value === currentSource)?.label ?? "Shinigami";

  // Prevent hydration warnings and handle scroll
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSourceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChangeSource(source: ComicSource) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("source", source);
    params.set("provider", source); // Sync with search/explore page parameter
    localStorage.setItem("comic-source", source);
    setSourceDropdownOpen(false);
    router.push(`${pathname}?${params.toString()}`);
  }

  // Hide global navbar on reader pages
  if (pathname?.startsWith("/read/")) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", searchQuery.trim());
      router.push(`/search?${params.toString()}`);
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
      <header className={`fixed top-0 md:top-4 z-50 w-full px-0 md:px-4 transition-all duration-500`}>
        <div className={`mx-auto flex max-w-[1400px] h-16 md:h-18 items-center justify-between px-4 md:px-6 transition-all duration-500 ${
          isScrolled || !isHomePage
            ? "bg-surface/80 backdrop-blur-xl md:rounded-full border-b md:border border-border-dark/40"
            : "bg-transparent border-transparent"
        }`}>

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img src="/logo.png" alt="ComiHarth" className="h-12 md:h-15 w-auto object-contain transition-transform duration-500 group-hover:scale-105 dark:invert drop-shadow-md" />
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex relative w-72 lg:w-96 transition-all duration-300">
            <input
              type="text"
              placeholder="Search manga, manhwa, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-10 rounded-full pl-11 pr-5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent-green/50 transition-all ${
                isScrolled || !isHomePage
                  ? "bg-background/50 border border-border-dark/30 text-foreground placeholder-muted-text/70 focus:bg-background"
                  : "bg-black/10 dark:bg-white/10 border border-black/5 dark:border-white/10 text-black dark:text-white placeholder-black/60 dark:placeholder-white/60 focus:bg-white/50 dark:focus:bg-black/40 backdrop-blur-md"
              }`}
            />
            <Search className={`absolute left-4 top-3 h-4 w-4 ${isScrolled || !isHomePage ? 'text-muted-text/60' : 'text-black/60 dark:text-white/60'}`} />
          </form>

          {/* Action Panel */}
          <div className="flex items-center gap-2 md:gap-4">

            {/* Nav Links - Desktop */}
            <nav className="hidden lg:flex items-center gap-1 bg-background/30 dark:bg-black/20 p-1 rounded-full border border-border-dark/20 backdrop-blur-md">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-accent-green text-white shadow-md shadow-accent-green/20"
                        : `${isScrolled || !isHomePage ? 'text-muted-text hover:text-foreground hover:bg-surface' : 'text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-white/20 dark:hover:bg-black/20'}`
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Source Switcher */}
            {mounted && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-full border text-[10px] md:text-xs font-extrabold tracking-wide uppercase transition-all duration-300 cursor-pointer ${
                    isScrolled || !isHomePage
                      ? "bg-surface/50 border-border-dark/40 text-foreground hover:bg-surface shadow-sm"
                      : "bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/20 text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/20 backdrop-blur-md"
                  }`}
                >
                  <Database className="h-3.5 w-3.5 text-accent-green" />
                  <span className="hidden sm:inline text-muted-text font-semibold">Source:</span>
                  <span>{currentLabel}</span>
                  <ChevronDown className={`h-3 w-3 opacity-70 transition-transform duration-300 ${sourceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {sourceDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-44 rounded-2xl bg-surface/95 backdrop-blur-xl border border-border-dark/40 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1.5 flex flex-col gap-1">
                      {sources.map((source) => (
                        <button
                          key={source.value}
                          onClick={() => handleChangeSource(source.value)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            currentSource === source.value
                              ? "bg-accent-green/10 text-accent-green"
                              : "text-muted-text hover:bg-surface-hover hover:text-foreground"
                          }`}
                        >
                          {source.label}
                          {currentSource === source.value && <div className="h-1.5 w-1.5 rounded-full bg-accent-green" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`flex items-center justify-center h-9 w-9 md:h-10 md:w-10 rounded-full border transition-all duration-300 cursor-pointer ${
                  isScrolled || !isHomePage
                    ? "bg-surface/50 border-border-dark/40 text-muted-text hover:text-accent-green hover:bg-surface shadow-sm"
                    : "bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/20 text-black dark:text-white hover:bg-white/20 dark:hover:bg-black/20 backdrop-blur-md"
                }`}
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {/* Mobile Search Button */}
            <div className="flex md:hidden items-center">
              <Link
                href="/search"
                className={`p-2 rounded-full transition-colors ${
                  isScrolled || !isHomePage ? "text-muted-text hover:text-foreground" : "text-black/70 dark:text-white/70"
                }`}
              >
                <Search className="h-5 w-5" />
              </Link>
            </div>

          </div>
        </div>
      </header>
      {/* Spacer for non-home pages so content doesn't overlap the fixed navbar */}
      {!isHomePage && <div className="h-24 w-full shrink-0" />}
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-20 w-full shrink-0" />}>
      <NavbarContent />
    </Suspense>
  );
}
