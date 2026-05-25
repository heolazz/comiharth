"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComicSearchResult } from "@/lib/providers/types";
import ComicGrid from "@/components/comic/ComicGrid";
import { Search, Flame, Compass, Play, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

type ReadingHistoryItem = {
  comicId: string;
  comicTitle: string;
  comicCover: string;
  provider: string;
  chapterId: string;
  chapterNumber: string;
  lastReadAt: string;
};

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [popularComics, setPopularComics] = useState<ComicSearchResult[]>([]);
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch popular comics from our local api/search
    const fetchPopular = async () => {
      try {
        const res = await fetch("/api/search?q=a"); // general search query to trigger initial list
        if (res.ok) {
          const json = await res.json();
          if (json && json.success) {
            setPopularComics(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load featured comics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopular();

    // Load reading history from localStorage
    const savedHistory = localStorage.getItem("comiharth-history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as ReadingHistoryItem[];
        const sorted = parsed.sort(
          (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
        );
        setHistory(sorted.slice(0, 3)); // show top 3 items
      } catch (err) {
        console.error("Failed to parse history:", err);
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const genres = ["Action", "Adventure", "Fantasy", "System", "Dark Fantasy", "Comedy", "Mystery"];

  return (
    <div className="flex flex-col gap-16 pb-20 transition-colors duration-300">
      
      {/* 1. Cinematic Hero Section */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-8 pt-6">
        <div className="relative w-full rounded-3xl overflow-hidden bg-surface border border-border-dark/40 shadow-sm min-h-[380px] md:min-h-[420px] flex items-center">
          
          {/* Background overlay decorations */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-surface/90 to-transparent z-10 w-full md:w-2/3" />
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-35 md:opacity-75 z-0">
            <img
              src="https://assets.shngm.id/thumbnail/image/09919a8b39cb.jpeg"
              alt="Solo Leveling Splash Background"
              className="w-full h-full object-cover blur-[4px] md:blur-none transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-surface" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
          </div>

          <div className="relative z-20 w-full md:w-3/5 p-6 md:p-12 flex flex-col gap-5 items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent-green/20 bg-accent-green/10 text-[10px] font-extrabold tracking-widest text-accent-green uppercase">
              <Flame className="h-3 w-3" />
              Spotlight Series
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Solo Leveling: <br />
              <span className="bg-gradient-to-r from-accent-green via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Na Honjaman Level Up
              </span>
            </h1>
            
            <p className="text-xs md:text-sm text-muted-text max-w-lg leading-relaxed font-medium">
              10 tahun yang lalu, setelah Gerbang yang menghubungkan dunia nyata dengan dunia monster terbuka, beberapa orang biasa menerima kekuatan untuk berburu monster di dalam Dungeon. Mereka dikenal sebagai Hunter...
            </p>

            <div className="flex flex-wrap gap-3 items-center mt-2">
              <Link
                href="/comic/shinigami/5c612573-fe38-42df-8618-dc3de1c9d04a"
                className="flex items-center gap-2 h-11 px-6 rounded-xl bg-accent-green hover:bg-green-600 text-xs font-bold text-white transition-all shadow-md shadow-green-500/10 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Reading</span>
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-2 h-11 px-5 rounded-xl bg-surface hover:bg-surface-hover border border-border-dark text-xs font-bold text-foreground transition-colors cursor-pointer"
              >
                <Compass className="h-3.5 w-3.5 text-accent-green" />
                <span>Explore Catalog</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Minimalist Search & Quick Shortcuts */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-8 flex flex-col gap-6 -mt-4">
        <form onSubmit={handleSearch} className="w-full relative">
          <input
            type="text"
            placeholder="Search manga, manhwa, manhua, or alternative titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 rounded-2xl bg-surface border border-border-dark/50 pl-12 pr-6 text-xs text-foreground placeholder-muted-text/60 focus:outline-none focus:border-accent-green/60 focus:ring-1 focus:ring-accent-green/60 transition-all"
          />
          <Search className="absolute left-4.5 top-4 h-4 w-4 text-muted-text/50" />
        </form>

        <div className="flex flex-wrap gap-2 items-center justify-start overflow-x-auto pb-1 hide-scrollbar">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-text mr-1">Trending:</span>
          {genres.map((g) => (
            <Link
              key={g}
              href={`/search?q=${encodeURIComponent(g)}`}
              className="px-3 py-1 rounded-full text-[10px] font-bold bg-surface border border-border-dark/40 text-muted-text hover:text-accent-green hover:border-accent-green/30 hover:bg-accent-green/5 transition-all cursor-pointer whitespace-nowrap"
            >
              {g}
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Continue Reading Section */}
      {history.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 md:px-8 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-accent-green" />
            <h2 className="text-sm font-display font-extrabold text-foreground uppercase tracking-widest">
              Continue Reading
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {history.map((item) => (
              <div
                key={item.comicId}
                className="group relative flex items-center gap-4 p-3 rounded-2xl border border-border-dark/50 bg-surface hover:border-accent-green/20 transition-all"
              >
                <img
                  src={item.comicCover}
                  alt={item.comicTitle}
                  className="h-14 w-10 rounded-lg object-cover border border-border-dark/40"
                />
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-bold text-foreground truncate group-hover:text-accent-green transition-colors">
                    {item.comicTitle}
                  </span>
                  <span className="text-[10px] text-muted-text font-semibold">
                    Last read: Chapter {item.chapterNumber}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-bold mt-1">
                    {new Date(item.lastReadAt).toLocaleDateString()}
                  </span>
                </div>
                
                <Link
                  href={`/read/${item.provider}/${item.chapterId}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-border-dark hover:bg-accent-green hover:border-accent-green text-muted-text hover:text-white transition-all cursor-pointer"
                  title="Resume Reading"
                >
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Popular Series Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-8 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border-dark/20 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-accent-green" />
            <h2 className="text-sm font-display font-extrabold text-foreground uppercase tracking-widest">
              Trending Manga & Manhwa
            </h2>
          </div>
          <Link href="/search" className="text-[11px] font-bold text-accent-green hover:underline">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="aspect-[3/4] w-full rounded-2xl bg-surface border border-border-dark/50" />
                <div className="h-4 rounded bg-surface w-3/4" />
                <div className="h-3 rounded bg-surface w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <ComicGrid comics={popularComics} />
        )}
      </section>

    </div>
  );
}
