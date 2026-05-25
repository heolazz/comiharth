import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border-dark/20 pt-16 pb-24 md:pb-16 mt-auto overflow-hidden relative">
      {/* Playful background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1400px] px-4 md:px-8 relative z-10 flex flex-col items-center gap-8">
        {/* Playful logo and tagline */}
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <img src="/logo.png" alt="ComiHarth" className="h-20 w-auto object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 dark:invert" />
              <Sparkles className="absolute top-0 -right-6 h-6 w-6 text-yellow-400 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-125" />
            </div>
          </Link>
          <p className="text-sm font-medium text-foreground/80 text-center flex items-center gap-2">
            Your daily dose of <span className="line-through text-muted-text">reality escape</span> awesome comics!
          </p>
        </div>

        {/* Links with bouncy hover */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-bold text-muted-text">
          <Link href="/" className="hover:text-accent-green hover:-translate-y-1 transition-all duration-300">Explore</Link>
          <Link href="/library" className="hover:text-pink-500 hover:-translate-y-1 transition-all duration-300">My Library</Link>
          <Link href="/history" className="hover:text-blue-500 hover:-translate-y-1 transition-all duration-300">Reading History</Link>
        </div>

        {/* Divider */}
        <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-border-dark to-transparent opacity-50" />

        {/* Copyright & Made with love */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-3xl text-xs text-muted-text/80 gap-4">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} ComiHarth. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5 font-medium bg-background px-4 py-2 rounded-full border border-border-dark/50 shadow-sm">
            Crafted with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" /> for comic lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
