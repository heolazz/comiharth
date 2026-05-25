"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComicSearchResult } from "@/lib/providers/types";
import ComicGrid from "@/components/comic/ComicGrid";
import ComicSlider from "@/components/comic/ComicSlider";
import { Search, Flame, Compass, Play, Clock, TrendingUp, Zap, Star, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [trendingComics, setTrendingComics] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Feed States
  const [recommendedComics, setRecommendedComics] = useState<{
    manhwa: ComicSearchResult[];
    manga: ComicSearchResult[];
    manhua: ComicSearchResult[];
  }>({ manhwa: [], manga: [], manhua: [] });
  const [recTab, setRecTab] = useState<"manhwa" | "manga" | "manhua">("manhwa");
  
  const [recentComics, setRecentComics] = useState<{
    manhwa: ComicSearchResult[];
    manga: ComicSearchResult[];
    manhua: ComicSearchResult[];
  }>({ manhwa: [], manga: [], manhua: [] });
  const [recentTab, setRecentTab] = useState<"manhwa" | "manga" | "manhua">("manhwa");
  const [popularComics, setPopularComics] = useState<{
    daily: ComicSearchResult[];
    weekly: ComicSearchResult[];
    allTime: ComicSearchResult[];
  }>({ daily: [], weekly: [], allTime: [] });
  const [popularTab, setPopularTab] = useState<"daily" | "weekly" | "allTime">("daily");
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch all home feeds
    const fetchFeeds = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/home-feed");
        if (res.ok) {
          const json = await res.json();
          if (json && json.success) {
            setRecommendedComics({
              manhwa: json.data.recommended?.manhwa || [],
              manga: json.data.recommended?.manga || [],
              manhua: json.data.recommended?.manhua || []
            });
            setRecentComics({
              manhwa: json.data.recent?.manhwa || [],
              manga: json.data.recent?.manga || [],
              manhua: json.data.recent?.manhua || []
            });
            setPopularComics({
              daily: json.data.popular?.daily || [],
              weekly: json.data.popular?.weekly || [],
              allTime: json.data.popular?.allTime || []
            });
          }
        }
      } catch (err) {
        console.error("Failed to load home feeds:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeeds();

    // Fetch trending comics for hero slider
    const fetchTrending = async () => {
      try {
        const res = await fetch("/api/trending");
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data.length > 0) {
            setTrendingComics(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load trending comics:", err);
      }
    };

    fetchTrending();

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

  // Auto slide interval
  useEffect(() => {
    if (trendingComics.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trendingComics.length);
    }, 7000); // 7 seconds

    return () => clearInterval(interval);
  }, [trendingComics]);

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
      <section className="w-full">
        <div className="relative w-full overflow-hidden bg-background min-h-[450px] md:min-h-[650px] lg:min-h-[75vh] flex items-center">
          
          {trendingComics.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full flex items-center"
              >
                {/* Blurred Background */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={trendingComics[currentSlide].cover_image_url || trendingComics[currentSlide].cover_portrait_url}
                    alt={trendingComics[currentSlide].title}
                    className="w-full h-full object-cover object-[center_15%] opacity-20 dark:opacity-30 blur-[30px] scale-110"
                  />
                  <div className="absolute inset-0 bg-background/50 dark:bg-background/80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90 hidden md:block" />
                </div>

                <div className="relative z-20 mx-auto w-full max-w-[1400px] px-4 md:px-8 flex flex-row items-center justify-center gap-4 md:gap-14 h-full pt-24 pb-12 md:pt-32 md:pb-16">
                  
                  {/* Left: Poster Image */}
                  <motion.div 
                    initial={{ opacity: 0, x: -30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    className="w-[35%] sm:w-[30%] md:w-1/3 lg:w-1/4 flex justify-end shrink-0"
                  >
                    <div className="relative w-full max-w-[140px] md:max-w-[280px] aspect-[2/3] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl shadow-black/15 dark:shadow-black/50 border border-border-dark/20 group">
                      <img 
                        src={trendingComics[currentSlide].cover_portrait_url || trendingComics[currentSlide].cover_image_url} 
                        alt={trendingComics[currentSlide].title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </motion.div>

                  {/* Right: Details */}
                  <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                    className="w-[65%] sm:w-[70%] md:w-2/3 lg:w-3/4 flex flex-col gap-2 md:gap-4 items-start text-left md:pr-12"
                  >
                    <div className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-accent-green/30 bg-accent-green/20 text-[8px] md:text-[10px] font-extrabold tracking-wider text-accent-green uppercase backdrop-blur-md">
                      Top Trending
                    </div>
                    
                    <h1 className="font-display text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-foreground leading-tight dark:drop-shadow-lg line-clamp-3">
                      {trendingComics[currentSlide].title}
                    </h1>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-4 text-[9px] md:text-xs font-bold text-foreground/80 uppercase tracking-wider mt-0.5">
                      <span className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg border border-yellow-400/20">
                        <Star className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 fill-current" /> 9.8
                      </span>
                      <span className="bg-surface/50 backdrop-blur-md px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg border border-border-dark/50">Ongoing</span>
                      <span className="bg-surface/50 backdrop-blur-md px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md md:rounded-lg border border-border-dark/50 hidden sm:inline-flex">Manga</span>
                    </div>
                    
                    <p className="text-[11px] sm:text-xs md:text-base text-foreground/70 max-w-4xl leading-relaxed font-medium line-clamp-3 md:line-clamp-3 mt-1 md:mt-2">
                      {trendingComics[currentSlide].description || "No description available."}
                    </p>

                    <div className="flex flex-wrap gap-2 md:gap-3 items-center mt-1 md:mt-4 justify-start">
                      <Link
                        href={trendingComics[currentSlide].latest_chapter_id ? `/read/shinigami/${trendingComics[currentSlide].manga_id}~${trendingComics[currentSlide].latest_chapter_id}` : `/comic/shinigami/${trendingComics[currentSlide].manga_id}`}
                        className="flex items-center gap-1.5 md:gap-2 h-8 px-4 md:h-12 md:px-8 rounded-lg md:rounded-xl bg-accent-green hover:bg-green-600 text-xs md:text-sm font-bold text-white transition-all shadow-lg shadow-green-500/20 cursor-pointer"
                      >
                        <Play className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                        <span>Read</span>
                      </Link>
                      <Link
                        href={`/comic/shinigami/${trendingComics[currentSlide].manga_id}`}
                        className="flex items-center gap-1.5 md:gap-2 h-8 px-3 md:h-12 md:px-6 rounded-lg md:rounded-xl bg-surface/30 backdrop-blur-md hover:bg-surface/60 border border-border-dark text-xs md:text-sm font-bold text-foreground transition-colors cursor-pointer"
                      >
                        <Info className="h-3 w-3 md:h-4 md:w-4 text-accent-green" />
                        <span className="hidden sm:inline">Info</span>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="w-full h-full relative animate-pulse bg-surface/50">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90 hidden md:block" />
              </div>

              <div className="relative z-20 mx-auto w-full max-w-[1400px] px-4 md:px-8 flex flex-row items-center justify-center gap-4 md:gap-14 h-full pt-24 pb-12 md:pt-32 md:pb-16">
                
                {/* Left: Poster Image Placeholder */}
                <div className="w-[35%] sm:w-[30%] md:w-1/3 lg:w-1/4 flex justify-end shrink-0">
                  <div className="relative w-full max-w-[140px] md:max-w-[280px] aspect-[2/3] rounded-xl md:rounded-2xl overflow-hidden bg-border-dark/20 dark:bg-border-dark/40 border border-border-dark/20"></div>
                </div>

                {/* Right: Details Placeholder */}
                <div className="w-[65%] sm:w-[70%] md:w-2/3 lg:w-3/4 flex flex-col gap-2 md:gap-4 items-start text-left md:pr-12">
                  <div className="w-20 md:w-24 h-4 md:h-6 rounded-full bg-border-dark/20 dark:bg-border-dark/40"></div>
                  
                  <div className="w-3/4 h-6 md:h-12 bg-border-dark/30 dark:bg-border-dark/50 rounded-md mt-1 md:mt-2"></div>
                  <div className="w-1/2 h-6 md:h-12 bg-border-dark/30 dark:bg-border-dark/50 rounded-md"></div>

                  <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-4 mt-2">
                    <div className="w-12 md:w-16 h-4 md:h-6 bg-border-dark/20 dark:bg-border-dark/40 rounded-md"></div>
                    <div className="w-16 md:w-20 h-4 md:h-6 bg-border-dark/20 dark:bg-border-dark/40 rounded-md"></div>
                  </div>
                  
                  <div className="w-full h-3 md:h-4 bg-border-dark/10 dark:bg-border-dark/30 rounded-md mt-2 md:mt-4"></div>
                  <div className="w-full h-3 md:h-4 bg-border-dark/10 dark:bg-border-dark/30 rounded-md"></div>
                  <div className="w-2/3 h-3 md:h-4 bg-border-dark/10 dark:bg-border-dark/30 rounded-md"></div>

                  <div className="flex flex-wrap gap-2 md:gap-3 items-center mt-2 md:mt-4 justify-start">
                    <div className="w-24 md:w-36 h-8 md:h-12 rounded-lg md:rounded-xl bg-border-dark/30 dark:bg-border-dark/50"></div>
                    <div className="w-20 md:w-28 h-8 md:h-12 rounded-lg md:rounded-xl bg-border-dark/20 dark:bg-border-dark/40"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slider Indicators */}
          {trendingComics.length > 1 && (
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-12 z-30 flex gap-2">
              {trendingComics.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-accent-green' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. Minimalist Search & Quick Shortcuts */}
      <section className="mx-auto w-full max-w-[1400px] px-4 md:px-8 flex flex-col gap-6 -mt-4">
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
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-text mr-1">Trending:</span>
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
        <section className="mx-auto w-full max-w-[1400px] px-4 md:px-8 flex flex-col gap-4">
          <div className="flex items-center">
            <h2 className="text-sm font-display font-extrabold text-foreground uppercase tracking-wider">
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

      {/* 4. Recommendations Section */}
      <section className="mx-auto w-full max-w-[1400px] px-4 md:px-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-dark/20 pb-4 gap-4 sm:gap-0">
          <div className="flex items-center">
            <h2 className="text-sm font-display font-extrabold text-foreground uppercase tracking-wider">
              Recommended For You
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-surface/50 p-1 rounded-xl border border-border-dark/30 self-start sm:self-auto">
            {(["manhwa", "manga", "manhua"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRecTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  recTab === tab 
                    ? "bg-accent-green text-white shadow-sm" 
                    : "text-muted-text hover:text-foreground hover:bg-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex overflow-x-hidden gap-4 md:gap-6 pb-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse w-[140px] md:w-[160px] lg:w-[180px] shrink-0">
                <div className="aspect-[2/3] w-full rounded-2xl bg-surface border border-border-dark/50" />
                <div className="h-4 rounded bg-surface w-3/4" />
                <div className="h-3 rounded bg-surface w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={recTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ComicSlider comics={recommendedComics[recTab]} />
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* 5. Recently Updated Section */}
      <section className="mx-auto w-full max-w-[1400px] px-4 md:px-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-dark/20 pb-4 gap-4 sm:gap-0">
          <div className="flex items-center">
            <h2 className="text-sm font-display font-extrabold text-foreground uppercase tracking-wider">
              Recently Updated
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-surface/50 p-1 rounded-xl border border-border-dark/30 self-start sm:self-auto">
            {(["manhwa", "manga", "manhua"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRecentTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  recentTab === tab 
                    ? "bg-accent-green text-white shadow-sm" 
                    : "text-muted-text hover:text-foreground hover:bg-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="aspect-[2/3] w-full rounded-2xl bg-surface border border-border-dark/50" />
                <div className="h-4 rounded bg-surface w-3/4" />
                <div className="h-3 rounded bg-surface w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={recentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ComicGrid comics={recentComics[recentTab]} />
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* 6. Popular Series Grid */}
      <section className="mx-auto w-full max-w-[1400px] px-4 md:px-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-dark/20 pb-4 gap-4 sm:gap-0">
          <div className="flex items-center">
            <h2 className="text-sm font-display font-extrabold text-foreground uppercase tracking-wider">
              Popular Comics
            </h2>
          </div>
          
          <div className="flex items-center gap-2 bg-surface/50 p-1 rounded-xl border border-border-dark/30 self-start sm:self-auto">
            {(["daily", "weekly", "allTime"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setPopularTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  popularTab === tab 
                    ? "bg-accent-green text-white shadow-sm" 
                    : "text-muted-text hover:text-foreground hover:bg-surface"
                }`}
              >
                {tab === "allTime" ? "All Time" : tab}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="aspect-[2/3] w-full rounded-2xl bg-surface border border-border-dark/50" />
                <div className="h-4 rounded bg-surface w-3/4" />
                <div className="h-3 rounded bg-surface w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={popularTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ComicGrid comics={popularComics[popularTab]} />
            </motion.div>
          </AnimatePresence>
        )}
      </section>

    </div>
  );
}
