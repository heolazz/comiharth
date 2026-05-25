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
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 py-10 md:py-16 flex flex-col gap-12 transition-colors duration-500 overflow-hidden relative">

      {/* Joyful Background Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-green/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/2 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Playful Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <h1 className="text-4xl md:text-6xl font-display font-black text-foreground tracking-tight flex items-center gap-3">
              Your Shelf
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base text-muted-text font-bold max-w-xl"
          >
            Welcome back! Ready to dive back into your favorite worlds?
          </motion.p>
        </div>

        {historyList.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearHistory}
            className="flex h-12 items-center justify-center gap-2 px-6 rounded-[20px] border-2 border-border-dark bg-surface hover:bg-surface-hover text-sm font-bold text-muted-text hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer shadow-sm group"
          >
            <Trash2 className="h-4 w-4 group-hover:animate-bounce" />
            <span>Clear History</span>
          </motion.button>
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
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="rounded-[40px] border-2 border-dashed border-border-dark/60 bg-surface/30 p-16 text-center flex flex-col items-center justify-center gap-6 max-w-xl mx-auto mt-10 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-green/5 to-transparent pointer-events-none" />
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="h-28 w-28 rounded-[32px] bg-gradient-to-br from-accent-green/20 to-teal-500/20 border-2 border-accent-green/30 flex items-center justify-center shadow-inner relative"
          >
            <Compass className="h-14 w-14 text-accent-green drop-shadow-md" />
            <Sparkles className="absolute -top-3 -right-3 h-8 w-8 text-yellow-400 animate-pulse" />
          </motion.div>
          <div className="flex flex-col gap-2 relative z-10">
            <h3 className="text-2xl font-black text-foreground">It's so empty here!</h3>
            <p className="text-sm text-muted-text mx-auto font-bold leading-relaxed max-w-xs">
              Go explore some amazing comics and start your adventure. Your journey will be recorded right here.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 h-14 px-8 rounded-full bg-accent-green hover:bg-green-600 text-base font-bold text-white transition-all cursor-pointer mt-4 shadow-xl shadow-green-500/30 hover:scale-110 active:scale-95 relative z-10"
          >
            <Flame className="h-5 w-5" />
            <span>Let's Explore!</span>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          <AnimatePresence>
            {historyList.map((item, index) => (
              <motion.div
                key={item.comicId}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative flex flex-col rounded-[24px] border-2 border-border-dark/30 bg-surface transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-accent-green/30 overflow-hidden cursor-pointer aspect-[5/7]"
              >
                {/* Full Cover Image */}
                <img
                  src={item.comicCover}
                  alt={item.comicTitle}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2"
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:via-background/60" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-between z-10">
                  {/* Top: Chapter Badge & Time */}
                  <div className="flex justify-between items-start">
                    <div className="bg-background/90 backdrop-blur-md border border-border-dark/50 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full flex items-center gap-1.5 shadow-lg transform -rotate-2 group-hover:rotate-0 transition-transform">
                      <BookOpen className="h-3.5 w-3.5 text-accent-green" />
                      <span className="text-[10px] md:text-xs font-black text-foreground truncate max-w-[60px] md:max-w-[100px]">
                        Ch. {item.chapterNumber}
                      </span>
                    </div>
                    
                    <span className="text-[10px] text-white/90 font-bold flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(item.lastReadAt)}
                    </span>
                  </div>

                  {/* Bottom: Title & Play Button */}
                  <div className="flex flex-col gap-3">
                    <Link
                      href={`/comic/${item.provider}/${item.comicId}`}
                      className="text-sm md:text-lg font-black text-white hover:text-accent-green transition-colors line-clamp-2 leading-tight drop-shadow-md"
                      title={item.comicTitle}
                    >
                      {item.comicTitle}
                    </Link>
                    
                    <div className="overflow-hidden">
                      <Link
                        href={`/read/${item.provider}/${item.chapterId}`}
                        className="flex items-center justify-center gap-2 w-full h-10 md:h-12 rounded-[16px] bg-accent-green hover:bg-green-600 text-white shadow-xl shadow-accent-green/20 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Play className="h-4 w-4 fill-current" />
                        <span className="font-bold text-xs md:text-sm">Resume</span>
                      </Link>
                    </div>
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
