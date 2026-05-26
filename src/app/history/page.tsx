"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Play, Trash2, Compass, Loader2, BookOpen, Clock, Sparkles, Flame } from "lucide-react";
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

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function HistoryPage() {
  const [historyList, setHistoryList] = useState<ReadingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = () => {
      const saved = localStorage.getItem("comiharth-history");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as ReadingHistoryItem[];
          const sorted = parsed.sort(
            (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
          );
          setHistoryList(sorted);
        } catch (e) {
          console.error("Failed to parse history:", e);
        }
      }
      setIsLoading(false);
    };

    fetchHistory();
  }, []);

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your entire reading history? This action cannot be undone.")) {
      localStorage.removeItem("comiharth-history");
      setHistoryList([]);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 py-10 md:py-16 flex flex-col gap-8 md:gap-12 transition-colors duration-500 overflow-hidden relative">

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground flex items-center gap-2">
            <History className="h-6 w-6 text-accent-green" />
            Reading History
          </h1>
          <p className="text-xs text-muted-text font-semibold">
            Welcome back! Ready to dive back into your favorite worlds?
          </p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex h-9 w-fit items-center justify-center gap-2 px-4 rounded-xl border border-border-dark/50 bg-surface hover:bg-surface-hover text-xs font-bold text-muted-text hover:text-accent-green hover:border-accent-green/30 transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Items list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-accent-green blur-xl opacity-20 rounded-full animate-pulse" />
            <Loader2 className="h-12 w-12 text-accent-green animate-spin relative z-10" />
          </div>
          <p className="text-base text-foreground font-bold animate-pulse">Summoning your comics...</p>
        </div>
      ) : historyList.length === 0 ? (
        <div className="rounded-3xl border border-border-dark/40 bg-surface/30 p-16 text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto mt-6">
          <div className="h-16 w-16 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
            <History className="h-8 w-8 text-accent-green" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-bold text-foreground">Your history is currently empty</h3>
            <p className="text-xs text-muted-text max-w-xs mx-auto font-medium leading-relaxed">
              Go explore some amazing comics and start your adventure. Your reading journey will be saved right here.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-accent-green hover:bg-green-600 text-xs font-bold text-white transition-colors cursor-pointer mt-2 shadow-md glow-green-sm"
          >
            <Compass className="h-4 w-4" />
            <span>Discover Comics</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-5">
          <AnimatePresence>
            {historyList.map((item, index) => (
              <motion.div
                key={item.comicId}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                whileHover={{ y: -4 }}
                className="group relative flex flex-col bg-transparent transition-all duration-300"
              >
                <Link href={`/read/${item.provider}/${item.chapterId}`} className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border-dark/30 shadow-sm group-hover:border-accent-green/40 group-hover:shadow-[0_8px_25px_rgba(0,200,83,0.15)] transition-all duration-300 block">
                  {/* Cover Image */}
                  <img
                    src={item.comicCover}
                    alt={item.comicTitle}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Dynamic Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10">
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-md bg-accent-green text-white border-accent-green shadow-sm">
                      CH. {item.chapterNumber}
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 flex flex-wrap gap-1.5 z-10">
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md border backdrop-blur-md bg-black/70 text-white border-transparent shadow-sm flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {formatRelativeTime(item.lastReadAt)}
                    </span>
                  </div>

                  {/* Hover overlay shadow gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-accent-green text-white flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <Play className="h-4 w-4 md:h-5 md:w-5 fill-current ml-1" />
                    </div>
                  </div>
                </Link>

                {/* Info Block */}
                <div className="pt-2.5 pb-1 flex flex-col flex-1 bg-transparent">
                  <h3 className="font-display font-bold text-[12px] md:text-[14px] text-center text-foreground line-clamp-2 leading-[1.4] h-[34px] md:h-[40px] group-hover:text-accent-green transition-colors duration-200" title={item.comicTitle}>
                    <Link href={`/comic/${item.provider}/${item.comicId}`}>
                      {item.comicTitle}
                    </Link>
                  </h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
