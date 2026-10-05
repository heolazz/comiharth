"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Chapter } from "@/lib/providers/types";
import { ArrowUpDown, Search, Play, BookOpen, Check } from "lucide-react";

interface ChapterListProps {
  chapters: Chapter[];
  provider: string;
}

export default function ChapterList({ chapters, provider }: ChapterListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDescending, setIsDescending] = useState(true);
  const [readChapters, setReadChapters] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("comiharth-read-chapters");
    if (saved) {
      try {
        setReadChapters(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Filter and sort chapters
  const filteredChapters = chapters
    .filter(
      (ch) =>
        ch.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ch.chapterNumber?.includes(searchTerm)
    )
    .sort((a, b) => {
      const numA = parseFloat(a.chapterNumber || "0");
      const numB = parseFloat(b.chapterNumber || "0");
      return isDescending ? numB - numA : numA - numB;
    });

  return (
    <div className="flex flex-col gap-4 transition-colors duration-300">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <h2 className="text-xl font-display font-extrabold text-foreground flex items-center gap-2 self-start">
          <BookOpen className="h-5 w-5 text-accent-green" />
          Chapters ({chapters.length})
        </h2>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Filter chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 rounded-xl bg-surface-hover border border-border-dark/60 pl-8 pr-4 text-xs text-foreground placeholder-muted-text/60 focus:outline-none focus:border-accent-green/50 transition-all"
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-text/50" />
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setIsDescending(!isDescending)}
            className="flex h-9 items-center gap-1.5 px-3 rounded-xl border border-border-dark/50 bg-surface hover:bg-surface-hover text-xs font-bold text-foreground transition-all cursor-pointer shadow-sm"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-accent-green" />
            <span>{isDescending ? "Newest" : "Oldest"}</span>
          </button>
        </div>
      </div>

      {/* Chapters Table/Grid */}
      {filteredChapters.length === 0 ? (
        <div className="rounded-2xl border border-border-dark/30 bg-surface/30 p-8 text-center text-sm text-muted-text font-semibold">
          No chapters match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1 hide-scrollbar">
          {filteredChapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/read/${provider}/${chapter.id}`}
              className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border border-border-dark/40 bg-surface hover:border-accent-green/30 hover:bg-surface-hover/80 hover:shadow-[0_4px_15px_rgba(0,200,83,0.06)] transition-all gap-3 sm:gap-4"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                {chapter.thumbnail && (
                  <div className="relative w-28 sm:w-36 md:w-44 aspect-video rounded-xl overflow-hidden shrink-0 border border-border-dark/40 bg-surface-hover flex items-center justify-center shadow-sm">
                    <img
                      src={chapter.thumbnail.includes("default.jpg") ? "/logo.png" : chapter.thumbnail}
                      alt={`Chapter ${chapter.chapterNumber}`}
                      loading="lazy"
                      className={
                        chapter.thumbnail === "/logo.png" || chapter.thumbnail.includes("default.jpg")
                          ? "w-full h-full object-contain p-2 dark:invert opacity-75 group-hover:scale-105 transition-transform duration-300"
                          : "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      }
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.endsWith("/logo.png")) {
                          (target.parentElement as HTMLElement)?.classList.add("hidden");
                        } else {
                          target.src = "/logo.png";
                          target.className = "w-full h-full object-contain p-2 dark:invert opacity-75 group-hover:scale-105 transition-transform duration-300";
                        }
                      }}
                    />
                    {chapter.thumbnail !== "/logo.png" && !chapter.thumbnail.includes("default.jpg") && (
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/35 transition-colors pointer-events-none flex items-center justify-center">
                        <div className="h-7 w-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
                          <Play className="h-3 w-3 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className={`text-sm sm:text-base font-bold transition-colors flex items-center gap-2 ${readChapters.includes(chapter.id) ? "text-muted-text" : "text-foreground group-hover:text-accent-green"}`}>
                    Chapter {chapter.chapterNumber}
                    {readChapters.includes(chapter.id) && <Check className="h-4 w-4 text-accent-green shrink-0" />}
                  </span>
                  {chapter.title && chapter.title !== `Chapter ${chapter.chapterNumber}` && (
                    <span className="text-xs text-muted-text font-semibold line-clamp-1">
                      {chapter.title}
                    </span>
                  )}
                  {chapter.createdAt && (
                    <span className="text-[11px] text-zinc-500 font-semibold sm:hidden">
                      {chapter.createdAt}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {chapter.createdAt && (
                  <span className="text-[11px] text-zinc-500 font-bold whitespace-nowrap hidden sm:inline-block">
                    {chapter.createdAt}
                  </span>
                )}
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-surface-hover border border-border-dark/50 group-hover:bg-accent-green group-hover:border-accent-green transition-all shadow-sm shrink-0">
                  <Play className="h-3.5 w-3.5 fill-current text-muted-text group-hover:text-white transition-colors ml-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
