"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Play, Trash2, Compass, Loader2, BookOpen } from "lucide-react";

type ReadingHistoryItem = {
  comicId: string;
  comicTitle: string;
  comicCover: string;
  provider: string;
  chapterId: string;
  chapterNumber: string;
  lastReadAt: string;
};

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
    if (confirm("Are you sure you want to clear your reading history?")) {
      localStorage.removeItem("comiharth-history");
      setHistoryList([]);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 md:px-8 py-10 flex flex-col gap-8 transition-colors duration-300">
      {/* Title Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground flex items-center gap-2">
            <History className="h-6 w-6 text-accent-green" />
            Recently Read History
          </h1>
          <p className="text-xs text-muted-text font-semibold">
            Track your reading progress and pick up exactly where you left off.
          </p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex h-9 items-center gap-1.5 px-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold text-red-400 transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        )}
      </div>

      {/* History Items list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-accent-green animate-spin" />
          <p className="text-xs text-muted-text font-semibold">Loading history list...</p>
        </div>
      ) : historyList.length === 0 ? (
        <div className="rounded-3xl border border-border-dark/45 bg-surface/30 p-16 text-center flex flex-col items-center justify-center gap-4 max-w-md mx-auto mt-6">
          <div className="h-16 w-16 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
            <History className="h-8 w-8 text-accent-green" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-bold text-foreground">No recently read comics</h3>
            <p className="text-xs text-muted-text max-w-xs mx-auto font-medium leading-relaxed">
              Your reading logs will automatically record here as you browse and read manga.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-accent-green hover:bg-green-600 text-xs font-bold text-white transition-colors cursor-pointer mt-2 shadow-md glow-green-sm"
          >
            <Compass className="h-4 w-4" />
            <span>Go to catalog</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {historyList.map((item) => (
            <div
              key={item.comicId}
              className="group relative flex items-center justify-between p-4 rounded-2xl border border-border-dark/40 bg-surface/40 hover:border-accent-green/30 transition-all hover:bg-surface-hover/30"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.comicCover}
                  alt={item.comicTitle}
                  className="h-20 w-15 rounded-xl object-cover border border-border-dark"
                />
                
                <div className="flex flex-col gap-1 min-w-0">
                  <Link
                    href={`/comic/${item.provider}/${item.comicId}`}
                    className="text-base font-bold text-foreground hover:text-accent-green transition-colors truncate"
                  >
                    {item.comicTitle}
                  </Link>
                  
                  <span className="text-xs text-muted-text font-medium flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-accent-green/80" />
                    Currently on: <span className="text-foreground font-bold">Chapter {item.chapterNumber}</span>
                  </span>
                  
                  <span className="text-[10px] text-zinc-500 font-bold">
                    Read: {new Date(item.lastReadAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href={`/read/${item.provider}/${item.chapterId}`}
                className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-accent-green hover:bg-green-600 text-xs font-bold text-white transition-all cursor-pointer shadow-md glow-green-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Resume</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
