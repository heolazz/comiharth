import Link from "next/link";
import { Flame } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-border-dark/20 py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10 border border-accent-blue/20">
            <Flame className="h-4 w-4 text-accent-blue" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            Comi<span className="text-accent-blue">Harth</span>
          </span>
        </div>
        <p className="text-xs text-muted-text text-center md:text-left">
          &copy; {new Date().getFullYear()} ComiHarth. Built for premium immersive comic reading. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-muted-text">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/library" className="hover:text-white transition-colors">Library</Link>
          <Link href="/history" className="hover:text-white transition-colors">History</Link>
        </div>
      </div>
    </footer>
  );
}
