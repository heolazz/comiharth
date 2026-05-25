"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ComicDetail, Chapter } from "@/lib/providers/types";
import ChapterList from "@/components/comic/ChapterList";
import { Play, Heart, Star, BookOpen, User, Loader2 } from "lucide-react";

type FavoriteItem = {
  id: string;
  provider: string;
  title: string;
  cover: string;
  type: string;
  status: string;
};

type ReadingHistoryItem = {
  comicId: string;
  chapterId: string;
  chapterNumber: string;
};

export default function ComicDetailPage({
  params,
}: {
  params: Promise<{ provider: string; id: string }>;
}) {
  const { provider, id } = use(params);
  
  const [comic, setComic] = useState<ComicDetail | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [resumeChapterId, setResumeChapterId] = useState<string | null>(null);
  const [resumeChapterNum, setResumeChapterNum] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError("");
      try {
        // Fetch comic details
        const detailRes = await fetch(`/api/comic/${provider}/${id}`);
        if (!detailRes.ok) throw new Error("Failed to load comic details");
        const detailJson = await detailRes.json();
        
        if (detailJson.success) {
          setComic(detailJson.data);
        } else {
          throw new Error(detailJson.error?.message || "Failed to load comic details");
        }

        // Fetch chapters list
        const chaptersRes = await fetch(`/api/chapters/${provider}/${id}`);
        if (chaptersRes.ok) {
          const chaptersJson = await chaptersRes.json();
          if (chaptersJson.success) {
            setChapters(chaptersJson.data);
          }
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();

    // Check if favorited
    const savedFavorites = localStorage.getItem("comiharth-favorites");
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites) as FavoriteItem[];
        setIsFavorited(parsed.some((fav) => fav.id === id && fav.provider === provider));
      } catch (e) {
        console.error(e);
      }
    }

    // Check reading history to determine resume chapter
    const savedHistory = localStorage.getItem("comiharth-history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as ReadingHistoryItem[];
        const item = parsed.find((h) => h.comicId === id);
        if (item) {
          setResumeChapterId(item.chapterId);
          setResumeChapterNum(item.chapterNumber);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [provider, id]);

  const toggleFavorite = () => {
    if (!comic) return;
    
    const savedFavorites = localStorage.getItem("comiharth-favorites");
    let favoritesList: FavoriteItem[] = [];
    
    if (savedFavorites) {
      try {
        favoritesList = JSON.parse(savedFavorites);
      } catch (e) {
        console.error(e);
      }
    }

    if (isFavorited) {
      // Remove
      favoritesList = favoritesList.filter((fav) => !(fav.id === id && fav.provider === provider));
      setIsFavorited(false);
    } else {
      // Add
      favoritesList.push({
        id: comic.id,
        provider: comic.provider,
        title: comic.title,
        cover: comic.cover || "",
        type: comic.type || "manga",
        status: comic.status || "ongoing"
      });
      setIsFavorited(true);
    }

    localStorage.setItem("comiharth-favorites", JSON.stringify(favoritesList));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-8 w-8 text-accent-green animate-spin" />
        <p className="text-xs text-muted-text font-semibold">Retrieving comic archive and chapters indexes...</p>
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 w-full text-red-400">
          <p className="font-bold text-base mb-1">Retrieval Error</p>
          <p className="text-xs">{error || "Failed to load comic details"}</p>
        </div>
        <Link
          href="/"
          className="text-xs font-bold text-accent-green hover:underline"
        >
          Return to home library
        </Link>
      </div>
    );
  }

  // First chapter resolution
  const firstChapter = chapters.length > 0 ? [...chapters].sort((a, b) => parseFloat(a.chapterNumber || "0") - parseFloat(b.chapterNumber || "0"))[0] : null;

  return (
    <div className="w-full relative min-h-screen bg-background transition-colors duration-300">

      <div className="mx-auto max-w-6xl px-4 md:px-8 pt-10 pb-20 relative z-10 flex flex-col gap-12">
        {/* Splitted header info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Left: Graphic Cover Card */}
          <div className="md:col-span-4 flex flex-col gap-4 mx-auto md:mx-0 w-64 md:w-full">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-border-dark/60 shadow-2xl bg-surface glow-green-sm">
              <img
                src={comic.cover}
                alt={comic.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Library favorite button */}
            <button
              onClick={toggleFavorite}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-bold transition-all cursor-pointer shadow-md ${
                isFavorited
                  ? "bg-red-500/10 border-red-500/40 text-red-500"
                  : "bg-surface hover:bg-surface-hover border-border-dark text-foreground"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
              <span>{isFavorited ? "In Library" : "Add to Library"}</span>
            </button>
          </div>

          {/* Right: Textual Comic Info Details */}
          <div className="md:col-span-8 flex flex-col gap-5 text-center md:text-left">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {comic.type && (
                <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-accent-green/10 border border-accent-green/20 text-accent-green">
                  {comic.type}
                </span>
              )}
              {comic.status && (
                <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-surface border border-border-dark text-muted-text">
                  {comic.status}
                </span>
              )}
              {comic.year && (
                <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider bg-surface border border-border-dark text-muted-text">
                  {comic.year}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-foreground leading-tight">
              {comic.title}
            </h1>
            
            {comic.altTitles && comic.altTitles.length > 0 && (
              <p className="text-xs text-muted-text font-semibold leading-relaxed">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] mr-1.5">Alternative:</span>
                {comic.altTitles.join(" / ")}
              </p>
            )}

            {/* Creators & Authors info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-y border-border-dark/30 my-2 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 justify-center md:justify-start">
                  <User className="h-3 w-3 text-accent-green/70" /> Author
                </span>
                <span className="text-foreground font-semibold">{comic.author?.join(", ") || "Unknown"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 justify-center md:justify-start">
                  <User className="h-3 w-3 text-accent-green/70" /> Artist
                </span>
                <span className="text-foreground font-semibold">{comic.artist?.join(", ") || "Unknown"}</span>
              </div>
              {comic.rating && (
                <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 justify-center md:justify-start">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> Rating
                  </span>
                  <span className="text-foreground font-extrabold flex items-center gap-1 justify-center md:justify-start">
                    {comic.rating} / 10
                  </span>
                </div>
              )}
            </div>

            {/* Genres badge container */}
            {comic.genres && comic.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                {comic.genres.map((genre) => (
                  <Link
                    key={genre}
                    href={`/search?q=${encodeURIComponent(genre)}`}
                    className="px-2.5 py-1 bg-surface hover:border-accent-green/30 hover:bg-accent-green/5 border border-border-dark text-[10px] font-bold text-muted-text hover:text-accent-green rounded-lg transition-all cursor-pointer"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis Description */}
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 justify-center md:justify-start">
                <BookOpen className="h-3.5 w-3.5 text-accent-green" />
                Synopsis Description
              </h3>
              <p className="text-sm text-muted-text leading-relaxed text-justify md:text-left font-medium">
                {comic.description || "No description provided for this comic index."}
              </p>
            </div>

            {/* Action Reading buttons */}
            <div className="mt-4 flex flex-wrap gap-4 items-center justify-center md:justify-start">
              {resumeChapterId ? (
                <Link
                  href={`/read/${provider}/${resumeChapterId}`}
                  className="flex items-center gap-2.5 h-12 px-8 rounded-2xl bg-accent-green hover:bg-green-600 text-sm font-extrabold text-white transition-all shadow-lg glow-green cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Resume Chapter {resumeChapterNum}</span>
                </Link>
              ) : firstChapter ? (
                <Link
                  href={`/read/${provider}/${firstChapter.id}`}
                  className="flex items-center gap-2.5 h-12 px-8 rounded-2xl bg-accent-green hover:bg-green-600 text-sm font-extrabold text-white transition-all shadow-lg glow-green cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Start Reading Ch. {firstChapter.chapterNumber}</span>
                </Link>
              ) : (
                <div className="h-12 px-8 flex items-center justify-center rounded-2xl bg-surface border border-border-dark text-sm font-bold text-zinc-500 cursor-not-allowed">
                  No Chapters Available
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Chapters container shelf */}
        <section className="mt-6 pt-10 border-t border-border-dark/20">
          <ChapterList chapters={chapters} provider={provider} />
        </section>

      </div>
    </div>
  );
}
