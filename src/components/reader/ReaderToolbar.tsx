"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chapter } from "@/lib/providers/types";
import { ArrowLeft, Settings, Home, Maximize, Minimize } from "lucide-react";
import { useEffect, useState } from "react";

interface ReaderToolbarProps {
  comicTitle: string;
  comicId: string;
  provider: string;
  chapters: Chapter[];
  currentChapterId: string;
  onOpenSettings: () => void;
}

export default function ReaderToolbar({
  comicTitle,
  comicId,
  provider,
  chapters,
  currentChapterId,
  onOpenSettings,
}: ReaderToolbarProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };
  
  // Sort chapters ascending so they appear sequentially (1, 2, 3...) in dropdown
  const sortedChapters = [...chapters].sort((a, b) => {
    const numA = parseFloat(a.chapterNumber || "0");
    const numB = parseFloat(b.chapterNumber || "0");
    return numA - numB;
  });

  const currentChapter = chapters.find((ch) => ch.id === currentChapterId);

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      router.push(`/read/${provider}/${val}`);
    }
  };

  return (
    <header className="w-full bg-surface/90 backdrop-blur-md border-b border-border-dark/35 px-4 py-3 text-foreground flex items-center justify-between shadow-sm transition-colors duration-300">
      {/* Back and Title */}
      <div className="flex items-center gap-3 max-w-[50%]">
        <Link
          href={`/comic/${provider}/${comicId}`}
          className="p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer text-muted-text hover:text-foreground"
          title="Back to Detail"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-col min-w-0">
          <Link
            href={`/comic/${provider}/${comicId}`}
            className="text-xs font-semibold text-muted-text hover:text-foreground transition-colors truncate"
          >
            {comicTitle}
          </Link>
          <span className="text-sm font-extrabold tracking-tight truncate text-foreground">
            {currentChapter ? `Chapter ${currentChapter.chapterNumber}` : "Reading"}
          </span>
        </div>
      </div>

      {/* Center Actions: Chapter Dropdown Select */}
      <div className="flex items-center gap-2">
        <div className="relative group">
          <select
            value={currentChapterId}
            onChange={handleChapterChange}
            className="appearance-none bg-surface-hover border border-border-dark/60 rounded-xl pl-4 pr-10 py-2 text-xs font-extrabold text-foreground focus:outline-none focus:border-accent-green/70 focus:ring-1 focus:ring-accent-green/70 transition-all shadow-sm hover:border-border-dark cursor-pointer"
          >
            {sortedChapters.map((ch) => (
              <option key={ch.id} value={ch.id} className="bg-background text-foreground font-semibold">
                Chapter {ch.chapterNumber}
              </option>
            ))}
          </select>
          {/* Custom Dropdown Arrow */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-text group-hover:text-foreground transition-colors">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Right Actions: Settings & Home */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer text-muted-text hover:text-foreground hidden md:block"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer text-muted-text hover:text-foreground"
          title="Reader Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
        <Link
          href="/"
          className="p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer text-muted-text hover:text-foreground"
          title="Go to Home"
        >
          <Home className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
