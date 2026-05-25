import Link from "next/link";
import { ArrowLeft, ArrowRight, List } from "lucide-react";

interface ChapterNavigationProps {
  provider: string;
  comicId: string;
  nextChapterId?: string;
  previousChapterId?: string;
}

export default function ChapterNavigation({
  provider,
  comicId,
  nextChapterId,
  previousChapterId,
}: ChapterNavigationProps) {
  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4 flex flex-col items-center gap-4 transition-colors duration-300">
      <div className="flex w-full justify-between items-center gap-4">
        {/* Previous Button */}
        {previousChapterId ? (
          <Link
            href={`/read/${provider}/${previousChapterId}`}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-surface hover:bg-surface-hover border border-border-dark text-sm font-bold text-foreground transition-all cursor-pointer shadow-sm hover:border-accent-green/30"
          >
            <ArrowLeft className="h-4 w-4 text-accent-green" />
            <span>Prev Chapter</span>
          </Link>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-surface-hover/30 border border-border-dark/30 text-sm font-bold text-muted-text/40 cursor-not-allowed select-none">
            <ArrowLeft className="h-4 w-4" />
            <span>First Chapter</span>
          </div>
        )}

        {/* Next Button */}
        {nextChapterId ? (
          <Link
            href={`/read/${provider}/${nextChapterId}`}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-accent-green hover:bg-green-600 text-sm font-bold text-white transition-all cursor-pointer shadow-lg glow-green-sm"
          >
            <span>Next Chapter</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-surface-hover/30 border border-border-dark/30 text-sm font-bold text-muted-text/40 cursor-not-allowed select-none">
            <span>Last Chapter</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Back to Chapters List */}
      <Link
        href={`/comic/${provider}/${comicId}`}
        className="flex items-center justify-center gap-2 px-6 h-10 rounded-xl bg-surface border border-border-dark/65 text-xs font-semibold text-muted-text hover:text-foreground transition-colors cursor-pointer hover:border-accent-green/30"
      >
        <List className="h-3.5 w-3.5" />
        <span>Return to Chapter List</span>
      </Link>
    </div>
  );
}
