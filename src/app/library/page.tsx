"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ComicSearchResult } from "@/lib/providers/types";
import ComicGrid from "@/components/comic/ComicGrid";
import { Bookmark, Compass, Heart } from "lucide-react";

type FavoriteItem = {
  id: string;
  provider: string;
  title: string;
  cover: string;
  type: string;
  status: string;
};

export default function LibraryPage() {
  const [favorites, setFavorites] = useState<ComicSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = () => {
      const saved = localStorage.getItem("comiharth-favorites");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as FavoriteItem[];
          // Map to ComicSearchResult shape for ComicGrid
          const mapped: ComicSearchResult[] = parsed.map((item) => ({
            id: item.id,
            provider: item.provider,
            title: item.title,
            cover: item.cover,
            type: item.type as any,
            status: item.status as any,
            latestChapter: "Resume"
          }));
          setFavorites(mapped);
        } catch (e) {
          console.error("Failed to parse favorites:", e);
        }
      }
      setIsLoading(false);
    };

    fetchFavorites();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 py-10 flex flex-col gap-8 transition-colors duration-300">
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-accent-green" />
          My Bookmark Library
        </h1>
        <p className="text-xs text-muted-text font-semibold">
          Your saved manga, manhwa, and bookmarks. Offline storage enabled.
        </p>
      </div>

      {/* Grid Display */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-[3/4] w-full rounded-2xl bg-surface-hover border border-border-dark/50" />
              <div className="h-4 rounded bg-surface-hover w-3/4" />
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-3xl border border-border-dark/40 bg-surface/30 p-16 text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto mt-6">
          <div className="h-16 w-16 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
            <Heart className="h-8 w-8 text-accent-green" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-bold text-foreground">Your library is currently empty</h3>
            <p className="text-xs text-muted-text max-w-xs mx-auto font-medium leading-relaxed">
              Save your favorite manhwa and manga to access them instantly from this library shelf.
            </p>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-accent-green hover:bg-green-600 text-xs font-bold text-white transition-colors cursor-pointer mt-2 shadow-md glow-green-sm"
          >
            <Compass className="h-4 w-4" />
            <span>Discover Comics</span>
          </Link>
        </div>
      ) : (
        <ComicGrid comics={favorites} />
      )}
    </div>
  );
}
