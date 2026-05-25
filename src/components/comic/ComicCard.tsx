"use client";

import Link from "next/link";
import { ComicSearchResult } from "@/lib/providers/types";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface ComicCardProps {
  comic: ComicSearchResult;
}

export default function ComicCard({ comic }: ComicCardProps) {
  // Determine badge styling based on type
  const getTypeBadge = (type?: string) => {
    switch (type) {
      case "manhwa":
        return "bg-purple-600/10 text-purple-600 border-purple-500/20 dark:text-purple-400";
      case "manhua":
        return "bg-amber-600/10 text-amber-600 border-amber-500/20 dark:text-amber-400";
      case "manga":
        return "bg-accent-green/10 text-accent-green border-accent-green/20";
      default:
        return "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative flex flex-col rounded-2xl bg-surface border border-border-dark/60 overflow-hidden hover:border-accent-green/40 hover:shadow-[0_8px_30px_rgba(0,200,83,0.1)] transition-all duration-300"
    >
      <Link href={`/comic/${comic.provider}/${comic.id}`} className="relative aspect-[3/4] w-full overflow-hidden block">
        {/* Cover Image */}
        {comic.cover ? (
          <img
            src={comic.cover}
            alt={comic.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-surface-hover text-muted-text">
            No Image
          </div>
        )}

        {/* Dynamic Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-md ${getTypeBadge(comic.type)}`}>
            {comic.type || "manga"}
          </span>
        </div>

        {/* Hover overlay shadow gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
      </Link>

      {/* Info Block */}
      <div className="p-4 flex flex-col flex-1 bg-surface border-t border-border-dark/30">
        <h3 className="font-display font-bold text-sm text-foreground line-clamp-1 group-hover:text-accent-green transition-colors duration-200" title={comic.title}>
          <Link href={`/comic/${comic.provider}/${comic.id}`}>
            {comic.title}
          </Link>
        </h3>
        
        <div className="mt-2 flex items-center justify-between text-xs text-muted-text">
          <span className="flex items-center gap-1 font-medium">
            <BookOpen className="h-3.5 w-3.5 text-accent-green/80" />
            {comic.latestChapter || "Ch. 0"}
          </span>
          <span className="capitalize text-[10px] text-muted-text font-bold px-1.5 py-0.5 bg-surface-hover border border-border-dark/50 rounded-md">
            {comic.status || "unknown"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
