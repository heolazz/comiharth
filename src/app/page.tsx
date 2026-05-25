"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComicSearchResult } from "@/lib/providers/types";
import ComicGrid from "@/components/comic/ComicGrid";
import { Search, Flame, Compass, Play, BookOpen, Clock } from "lucide-react";
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
        const res = await fetch("/api/search?q=a"); // general search query to trigger mock/real data
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
        // Sort by last read date descending
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
    <div className="flex flex-col gap-10 pb-16 transition-colors duration-300">
      
      {/* 1. Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-accent-green/10 via-background to-background pt-10 pb-12 px-4 md:px-8">
        {/* Abstract background glow */}
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-accent-green/10 rounded-full blur-[120px] pointer-events-none dark:bg-accent-green/5" />
        
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Hero text */}
          <div className="lg:col-span-7 flex flex-col gap-4 text-center lg:text-left">
            <div className="inline-flex self-center lg:self-start items-center gap-1.5 px-3 py-1 rounded-full border border-accent-green/20 bg-accent-green/10 text-xs font-bold tracking-wide text-accent-green uppercase">
              <Flame className="h-3.5 w-3.5" />
              Spotlight Series
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Solo Leveling: <br />
              <span className="bg-gradient-to-r from-accent-green via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Na Honjaman Level Up
              </span>
            </h1>
            
            <p className="text-sm md:text-base text-muted-text max-w-2xl leading-relaxed font-medium">
              10 tahun yang lalu, setelah Gerbang yang menghubungkan dunia nyata dengan dunia monster terbuka, beberapa orang biasa menerima kekuatan untuk berburu monster di dalam Dungeon. Mereka dikenal sebagai Hunter...
            </p>

            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-4 items-center justify-center lg:justify-start">
              <Link
                href="/comic/shinigami/5c612573-fe38-42df-8618-dc3de1c9d04a"
                className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-accent-green hover:bg-green-600 text-sm font-bold text-white transition-all shadow-lg glow-green cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Reading</span>
              </Link>
              <Link
                href="/search"
                className="flex items-center gap-2 h-12 px-6 rounded-2xl bg-surface border border-border-dark/60 hover:bg-surface-hover text-sm font-bold text-foreground transition-colors cursor-pointer"
              >
                <Compass className="h-4 w-4 text-accent-green" />
                <span>Explore All</span>
              </Link>
            </div>
          </div>

          {/* Large Hero Card Graphic */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-72 sm:w-80 aspect-[3/4] rounded-2xl overflow-hidden border border-accent-green/20 shadow-2xl hover:border-accent-green/50 transition-all group glow-green-sm"
            >
              <img
                src="https://assets.shngm.id/thumbnail/image/09919a8b39cb.jpeg"
                alt="Solo Leveling Banner"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] text-accent-green uppercase font-bold tracking-wider">Featured Manhwa</span>
                  <span className="text-base font-bold text-white">Na Honjaman Level Up</span>
                </div>
                <Link 
                  href="/comic/shinigami/5c612573-fe38-42df-8618-dc3de1c9d04a"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-green text-white shadow-lg shadow-green-500/20"
                >
                  <Play className="h-4 w-4 fill-current" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Search & Genre Shelf */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-8 flex flex-col gap-6">
        {/* Full-width Search Input */}
        <form onSubmit={handleSearch} className="w-full relative">
          <input
            type="text"
            placeholder="Search manga, manhwa, manhua, or genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 rounded-2xl bg-surface border border-border-dark/60 pl-14 pr-6 text-sm text-foreground placeholder-muted-text/60 focus:outline-none focus:border-accent-green/70 focus:ring-1 focus:ring-accent-green/70 transition-all shadow-md shadow-zinc-100/50 dark:shadow-none"
          />
          <Search className="absolute left-5 top-5 h-5 w-5 text-muted-text/50" />
          <button
            type="submit"
            className="absolute right-3.5 top-3 h-8 px-4 rounded-xl bg-accent-green hover:bg-green-600 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Genre pills shortcuts */}
        <div className="flex flex-wrap gap-2.5 items-center justify-start overflow-x-auto pb-1 hide-scrollbar">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-text/70 mr-1.5">Quick Genres:</span>
          {genres.map((g) => (
            <Link
              key={g}
              href={`/search?q=${encodeURIComponent(g)}`}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface border border-border-dark/50 text-muted-text hover:text-accent-green hover:border-accent-green/30 hover:bg-accent-green/5 transition-all cursor-pointer whitespace-nowrap"
            >
              {g}
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Continue Reading Section */}
      {history.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 md:px-8 flex flex-col gap-4">
          <h2 className="text-xl font-display font-extrabold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent-green" />
            Continue Reading
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {history.map((item) => (
              <div
                key={item.comicId}
                className="group relative flex items-center gap-4 p-3.5 rounded-2xl border border-border-dark/50 bg-surface hover:border-accent-green/30 transition-all hover:shadow-[0_4px_20px_rgba(0,200,83,0.03)]"
              >
                <img
                  src={item.comicCover}
                  alt={item.comicTitle}
                  className="h-16 w-12 rounded-xl object-cover border border-border-dark"
                />
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-bold text-foreground truncate group-hover:text-accent-green transition-colors">
                    {item.comicTitle}
                  </span>
                  <span className="text-xs text-muted-text font-semibold">
                    Last read: Chapter {item.chapterNumber}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold mt-1">
                    {new Date(item.lastReadAt).toLocaleDateString()}
                  </span>
                </div>
                
                <Link
                  href={`/read/${item.provider}/${item.chapterId}`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border-dark hover:bg-accent-green hover:border-accent-green text-muted-text hover:text-white transition-all cursor-pointer"
                  title="Resume Reading"
                >
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Popular Series Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-extrabold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent-green" />
            Trending Manga & Manhwa
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="aspect-[3/4] w-full rounded-2xl bg-surface-hover border border-border-dark/50" />
                <div className="h-4 rounded bg-surface-hover w-3/4" />
                <div className="h-3 rounded bg-surface-hover w-1/2" />
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
