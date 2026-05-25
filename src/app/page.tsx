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
        <div className="relative w-full overflow-hidden bg-background min-h-[500px] md:min-h-[600px] lg:min-h-[70vh] flex items-center">
          
          {trendingComics.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full flex items-center"
              >
                {/* Background overlay decorations */}
                <div className="absolute right-0 top-0 bottom-0 w-full md:w-[65%] z-0" 
                     style={{ 
                       WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
                       maskImage: 'linear-gradient(to left, black 50%, transparent 100%)' 
                     }}>
                  <img
                    src={trendingComics[currentSlide].cover_image_url || trendingComics[currentSlide].cover_portrait_url}
                    alt={trendingComics[currentSlide].title}
                    className="w-full h-full object-cover dark:opacity-80 opacity-90 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

                <div className="relative z-20 mx-auto w-full max-w-[1400px] px-4 md:px-8 flex items-center h-full">
                  <div className="w-full md:w-3/5 py-12 flex flex-col gap-5 items-start">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent-green/20 bg-accent-green/10 text-[10px] font-extrabold tracking-wider text-accent-green uppercase">
                      <TrendingUp className="h-3 w-3" />
                      Top Daily
                    </div>
                    
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight line-clamp-2 drop-shadow-md dark:drop-shadow-xl">
                      {trendingComics[currentSlide].title}
                    </h1>
                    
                    <p className="text-sm md:text-base text-muted-text max-w-lg leading-relaxed font-medium line-clamp-3 drop-shadow-sm dark:drop-shadow-md bg-background/50 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-2 md:p-0 rounded-lg">
                      {trendingComics[currentSlide].description || "No description available."}
                    </p>

                    <div className="flex flex-wrap gap-3 items-center mt-4">
                      <Link
                        href={trendingComics[currentSlide].latest_chapter_id ? `/read/shinigami/${trendingComics[currentSlide].manga_id}~${trendingComics[currentSlide].latest_chapter_id}` : `/comic/shinigami/${trendingComics[currentSlide].manga_id}`}
                        className="flex items-center gap-2 h-12 px-8 rounded-xl bg-accent-green hover:bg-green-600 text-sm font-bold text-white transition-all shadow-lg shadow-green-500/20 cursor-pointer"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        <span>Start Reading</span>
                      </Link>
                      <Link
                        href={`/comic/shinigami/${trendingComics[currentSlide].manga_id}`}
                        className="flex items-center gap-2 h-12 px-6 rounded-xl bg-surface/80 backdrop-blur-sm hover:bg-surface border border-border-dark text-sm font-bold text-foreground transition-colors cursor-pointer"
                      >
                        <Info className="h-4 w-4 text-accent-green" />
                        <span>More Info</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <>
              {/* Fallback Static Version */}
              <div className="absolute right-0 top-0 bottom-0 w-full md:w-[65%] z-0"
                   style={{ 
                     WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
                     maskImage: 'linear-gradient(to left, black 50%, transparent 100%)' 
                   }}>
                <img
                  src="https://assets.shngm.id/thumbnail/image/09919a8b39cb.jpeg"
                  alt="Solo Leveling Splash Background"
                  className="w-full h-full object-cover dark:opacity-80 opacity-90 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>

              <div className="relative z-20 mx-auto w-full max-w-[1400px] px-4 md:px-8 flex items-center h-full">
                <div className="w-full md:w-3/5 py-12 flex flex-col gap-5 items-start">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent-green/20 bg-accent-green/10 text-[10px] font-extrabold tracking-wider text-accent-green uppercase">
                    <Flame className="h-3 w-3" />
                    Spotlight Series
                  </div>
                  
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight drop-shadow-xl">
                    Solo Leveling: <br />
                    <span className="bg-gradient-to-r from-accent-green via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      Na Honjaman Level Up
                    </span>
                  </h1>
                  
                  <p className="text-sm md:text-base text-muted-text max-w-lg leading-relaxed font-medium drop-shadow-md">
                    10 tahun yang lalu, setelah Gerbang yang menghubungkan dunia nyata dengan dunia monster terbuka, beberapa orang biasa menerima kekuatan untuk berburu monster di dalam Dungeon...
                  </p>

                  <div className="flex flex-wrap gap-3 items-center mt-4">
                    <Link
                      href="/read/shinigami/5c612573-fe38-42df-8618-dc3de1c9d04a~latest-placeholder"
                      className="flex items-center gap-2 h-12 px-8 rounded-xl bg-accent-green hover:bg-green-600 text-sm font-bold text-white transition-all shadow-lg shadow-green-500/20 cursor-pointer"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>Start Reading</span>
                    </Link>
                    <Link
                      href="/comic/shinigami/5c612573-fe38-42df-8618-dc3de1c9d04a"
                      className="flex items-center gap-2 h-12 px-6 rounded-xl bg-surface/80 backdrop-blur-sm hover:bg-surface border border-border-dark text-sm font-bold text-foreground transition-colors cursor-pointer"
                    >
                      <Info className="h-4 w-4 text-accent-green" />
                      <span>More Info</span>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Slider Indicators */}
          {trendingComics.length > 1 && (
            <div className="absolute bottom-6 right-6 md:right-12 z-30 flex gap-2">
              {trendingComics.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-accent-green' : 'w-2 bg-white/30 hover:bg-white/50'}`}
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
