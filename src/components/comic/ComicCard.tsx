"use client";

import Link from "next/link";
import { ComicSearchResult } from "@/lib/providers/types";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface ComicCardProps {
  comic: ComicSearchResult;
  className?: string;
}

export default function ComicCard({ comic, className = "" }: ComicCardProps) {
  // Determine badge styling based on type
  const getTypeBadge = (type?: string) => {
    switch (type) {
      case "manhwa":
        return "bg-surface text-foreground border-border-dark/60 shadow-sm";
      case "manhua":
        return "bg-foreground text-surface border-transparent shadow-sm";
      case "manga":
        return "bg-accent-green text-white border-accent-green shadow-sm";
      default:
        return "bg-surface/90 text-muted-text border-border-dark/50";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`group relative flex flex-col bg-transparent transition-all duration-300 ${className}`}
    >
      <Link href={`/comic/${comic.provider}/${comic.id}`} className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-border-dark/30 shadow-sm group-hover:border-accent-green/40 group-hover:shadow-[0_8px_25px_rgba(0,200,83,0.15)] transition-all duration-300 block">
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
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10">
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-md ${getTypeBadge(comic.type)}`}>
            {comic.type || "manga"}
          </span>
        </div>

        {/* Hover overlay shadow gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Info Block */}
      <div className="pt-2.5 pb-1 flex flex-col flex-1 bg-transparent">
        <h3 className="font-display font-bold text-[15px] text-center text-foreground line-clamp-2 leading-[1.4] h-[42px] group-hover:text-accent-green transition-colors duration-200" title={comic.title}>
          <Link href={`/comic/${comic.provider}/${comic.id}`}>
            {comic.title}
          </Link>
        </h3>
        
        <div className="mt-1.5 flex items-center justify-between text-xs text-muted-text">
          <span className="font-semibold text-foreground/80">
            {comic.latestChapter || "Ch. 0"}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-muted-text font-bold">
            {comic.status === "ongoing" && <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />}
            {comic.status === "completed" && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
            <span className="capitalize">{comic.status || "unknown"}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
