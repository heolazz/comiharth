"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chapter } from "@/lib/providers/types";
import { ArrowLeft, Settings, Home } from "lucide-react";

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
    <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-border-dark/35 px-4 py-3 text-foreground flex items-center justify-between shadow-sm transition-colors duration-300">
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
        <div className="relative">
          <select
            value={currentChapterId}
            onChange={handleChapterChange}
            className="appearance-none bg-surface border border-border-dark rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:border-accent-green/50 transition-colors cursor-pointer"
          >
            {sortedChapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Chapter {ch.chapterNumber}
              </option>
            ))}
          </select>
          {/* Dropdown arrow conforming to light/dark modes */}
          <div className="absolute right-2.5 top-3 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground/80" />
        </div>
      </div>

      {/* Right Actions: Settings & Home */}
      <div className="flex items-center gap-1.5">
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
