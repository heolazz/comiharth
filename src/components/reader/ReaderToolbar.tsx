"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chapter } from "@/lib/providers/types";
import { ArrowLeft, Settings, Home, Maximize, Minimize, ChevronDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };
  
  const sortedChapters = [...chapters].sort((a, b) => {
    const numA = parseFloat(a.chapterNumber || "0");
    const numB = parseFloat(b.chapterNumber || "0");
    return numA - numB;
  });

  const currentChapter = chapters.find((ch) => ch.id === currentChapterId);

  const handleCustomChapterChange = (val: string) => {
    setIsDropdownOpen(false);
    if (val) {
      router.push(`/read/${provider}/${val}`);
    }
  };

  return (
    <header className="w-full bg-surface/90 backdrop-blur-md border-b border-border-dark/35 px-2 md:px-4 py-3 text-foreground flex items-center justify-between shadow-sm transition-colors duration-300">
      {/* Back and Title */}
      <div className="flex items-center gap-2 md:gap-3 max-w-[40%] md:max-w-[50%]">
        <Link
          href={`/comic/${provider}/${comicId}`}
          className="p-1.5 md:p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer text-muted-text hover:text-foreground shrink-0"
          title="Back to Detail"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex flex-col min-w-0">
          <Link
            href={`/comic/${provider}/${comicId}`}
            className="text-[10px] md:text-xs font-semibold text-muted-text hover:text-foreground transition-colors truncate"
          >
            {comicTitle}
          </Link>
          <span className="text-xs md:text-sm font-extrabold tracking-tight truncate text-foreground">
            {currentChapter ? `Ch. ${currentChapter.chapterNumber}` : "Reading"}
          </span>
        </div>
      </div>

      {/* Center Actions: Custom Chapter Dropdown Select */}
      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1.5 md:gap-2 bg-surface-hover border border-border-dark/60 rounded-xl pl-3 pr-2 md:pl-4 md:pr-3 py-1.5 md:py-2 text-[10px] md:text-xs font-extrabold text-foreground transition-all shadow-sm hover:border-border-dark cursor-pointer min-w-[90px] md:min-w-[120px] justify-between"
        >
          <span className="truncate">{currentChapter ? `Chapter ${currentChapter.chapterNumber}` : "Select"}</span>
          <ChevronDown className={`h-3.5 w-3.5 md:h-4 md:w-4 text-muted-text transition-transform duration-300 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 md:w-56 max-h-64 overflow-y-auto bg-surface/95 backdrop-blur-xl border border-border-dark/60 rounded-2xl shadow-xl z-50 py-2 scrollbar-thin scrollbar-thumb-border-dark/50 scrollbar-track-transparent">
            {sortedChapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleCustomChapterChange(ch.id)}
                className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-surface-hover ${currentChapterId === ch.id ? 'bg-accent-green/10 text-accent-green' : 'text-foreground'}`}
              >
                Chapter {ch.chapterNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Actions: Settings & Home */}
      <div className="flex items-center gap-0.5 md:gap-1.5 shrink-0">
        <button
          onClick={toggleFullscreen}
          className="p-1.5 md:p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer text-muted-text hover:text-foreground"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="h-4 w-4 md:h-5 md:w-5" /> : <Maximize className="h-4 w-4 md:h-5 md:w-5" />}
        </button>
        <button
          onClick={onOpenSettings}
          className="p-1.5 md:p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer text-muted-text hover:text-foreground"
          title="Reader Settings"
        >
          <Settings className="h-4 w-4 md:h-5 md:w-5" />
        </button>
        <Link
          href="/"
          className="p-1.5 md:p-2 hover:bg-surface-hover rounded-xl transition-colors cursor-pointer text-muted-text hover:text-foreground"
          title="Go to Home"
        >
          <Home className="h-4 w-4 md:h-5 md:w-5" />
        </Link>
      </div>
    </header>
  );
}
