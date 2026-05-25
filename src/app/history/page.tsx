"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Play, Trash2, Compass, Loader2, BookOpen, Clock, ChevronRight } from "lucide-react";
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
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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
          // Sort chronological descending
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
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 py-10 md:py-16 flex flex-col gap-10 transition-colors duration-300">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border-dark/20 pb-6">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent-green/20 bg-accent-green/10 text-[10px] font-extrabold tracking-wider text-accent-green uppercase w-fit">
            <Clock className="h-3 w-3" />
            Your Activity
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold text-foreground tracking-tight drop-shadow-sm">
            Reading History
          </h1>
          <p className="text-sm text-muted-text font-medium max-w-xl">
            Pick up right where you left off. Your reading logs are automatically saved locally on your device.
          </p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex h-10 items-center justify-center gap-2 px-4 rounded-xl border border-border-dark bg-surface hover:bg-surface-hover text-xs font-bold text-muted-text hover:text-accent-green hover:border-accent-green/30 transition-all cursor-pointer shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Items list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-10 w-10 text-accent-green animate-spin" />
          <p className="text-sm text-muted-text font-bold animate-pulse">Syncing your timeline...</p>
        </div>
      ) : historyList.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border-dark/40 bg-surface/20 p-16 text-center flex flex-col items-center justify-center gap-5 max-w-lg mx-auto mt-10 backdrop-blur-sm"
        >
          <div className="h-20 w-20 rounded-3xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center shadow-inner">
            <History className="h-10 w-10 text-accent-green" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-foreground">No reading history yet</h3>
            <p className="text-sm text-muted-text mx-auto font-medium leading-relaxed">
              Start reading any comic and your progress will automatically appear here for easy access.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-accent-green hover:bg-green-600 text-sm font-bold text-white transition-all cursor-pointer mt-4 shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95"
          >
            <Compass className="h-5 w-5" />
            <span>Discover Comics</span>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {historyList.map((item, index) => (
              <motion.div
                key={item.comicId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative flex overflow-hidden rounded-2xl border border-border-dark/40 bg-surface/50 hover:bg-surface hover:border-accent-green/30 transition-all shadow-sm hover:shadow-xl hover:shadow-accent-green/5"
              >
                {/* Image Section */}
                <div className="relative w-28 shrink-0 overflow-hidden bg-background">
                  <img
                    src={item.comicCover}
                    alt={item.comicTitle}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-surface/90 md:to-surface" />
                </div>
                
                {/* Content Section */}
                <div className="flex flex-col flex-grow p-4 justify-between min-w-0 z-10 -ml-4">
                  <div className="flex flex-col gap-1.5">
                    <Link
                      href={`/comic/${item.provider}/${item.comicId}`}
                      className="text-base font-bold text-foreground hover:text-accent-green transition-colors line-clamp-2 leading-tight"
                      title={item.comicTitle}
                    >
                      {item.comicTitle}
                    </Link>
                    
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className="text-muted-text">Ch.</span>
                      <span className="text-accent-green bg-accent-green/10 px-1.5 py-0.5 rounded-md">
                        {item.chapterNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[11px] text-muted-text/70 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(item.lastReadAt)}
                    </span>
                    
                    <Link
                      href={`/read/${item.provider}/${item.chapterId}`}
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-accent-green hover:bg-green-600 text-white transition-all shadow-md hover:scale-110"
                      title="Resume Reading"
                    >
                      <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
