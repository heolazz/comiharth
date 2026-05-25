"use client";

import { useState } from "react";
import Link from "next/link";
import { Chapter } from "@/lib/providers/types";
import { ArrowUpDown, Search, Play, BookOpen } from "lucide-react";

interface ChapterListProps {
  chapters: Chapter[];
  provider: string;
}

export default function ChapterList({ chapters, provider }: ChapterListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDescending, setIsDescending] = useState(true);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-1 hide-scrollbar">
          {filteredChapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/read/${provider}/${chapter.id}`}
              className="group flex items-center justify-between p-3.5 rounded-xl border border-border-dark/40 bg-surface hover:border-accent-green/30 hover:bg-surface-hover/80 hover:shadow-[0_4px_15px_rgba(0,200,83,0.05)] transition-all"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-foreground group-hover:text-accent-green transition-colors">
                  Chapter {chapter.chapterNumber}
                </span>
                {chapter.title && chapter.title !== `Chapter ${chapter.chapterNumber}` && (
                  <span className="text-[11px] text-muted-text font-semibold line-clamp-1">
                    {chapter.title}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {chapter.createdAt && (
                  <span className="text-[10px] text-zinc-500 font-bold hidden md:inline">
                    {chapter.createdAt}
                  </span>
                )}
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-hover border border-border-dark/50 group-hover:bg-accent-green group-hover:border-accent-green transition-all shadow-sm">
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
