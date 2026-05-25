"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ChapterPages, Chapter, ComicDetail } from "@/lib/providers/types";
import ReaderToolbar from "@/components/reader/ReaderToolbar";
import ReaderSettings, { ReaderPreferences } from "@/components/reader/ReaderSettings";
import ChapterNavigation from "@/components/reader/ChapterNavigation";
import { Loader2, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";

export default function ReaderPage({
  params,
}: {
  params: Promise<{ provider: string; chapterId: string }>;
}) {
  const { provider, chapterId } = use(params);

  // States
  const [pagesData, setPagesData] = useState<ChapterPages | null>(null);
  const [comic, setComic] = useState<ComicDetail | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Reading Prefs State
  const [preferences, setPreferences] = useState<ReaderPreferences>({
    width: "900px",
    mode: "vertical",
    theme: "white", // default to white for fresh and clean Webtoon style
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Single Page Mode Track
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Parse comic ID from chapter ID
  let comicId = "solo-leveling";
  if (chapterId.includes("~")) {
    comicId = chapterId.split("~")[0];
  } else {
    const match = chapterId.match(/(.+)-chapter-(\d+)/);
    if (match) {
      comicId = match[1];
    }
  }

  useEffect(() => {
    // Load preferences from localStorage on mount
    const savedPrefs = localStorage.getItem("comiharth-reader-prefs");
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchReaderData = async () => {
      setIsLoading(true);
      setError("");
      setCurrentPageIndex(0); // reset page index on chapter change
      try {
        // 1. Fetch pages
        const pagesRes = await fetch(`/api/pages/${provider}/${chapterId}`);
        if (!pagesRes.ok) throw new Error("Failed to load chapter pages");
        const pagesJson = await pagesRes.json();
        
        if (pagesJson.success) {
          setPagesData(pagesJson.data);
        } else {
          throw new Error(pagesJson.error?.message || "Failed to load chapter pages");
        }

        // 2. Fetch chapters first to determine current chapter details
        let activeChapterNumber = "1";
        const chaptersRes = await fetch(`/api/chapters/${provider}/${comicId}`);
        if (chaptersRes.ok) {
          const chaptersJson = await chaptersRes.json();
          if (chaptersJson.success) {
            setChapters(chaptersJson.data);
            const foundCh = chaptersJson.data.find((ch: any) => ch.id === chapterId);
            if (foundCh) {
              activeChapterNumber = foundCh.chapterNumber;
            } else {
              const match = chapterId.match(/(.+)-chapter-(\d+)/);
              if (match) activeChapterNumber = match[2];
            }
          }
        }

        // 3. Fetch comic detail for header
        const detailRes = await fetch(`/api/comic/${provider}/${comicId}`);
        if (detailRes.ok) {
          const detailJson = await detailRes.json();
          if (detailJson.success) {
            setComic(detailJson.data);
            
            // Save history
            saveToHistory(
              comicId,
              detailJson.data.title,
              detailJson.data.cover || "",
              chapterId,
              activeChapterNumber
            );
          }
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReaderData();
  }, [provider, chapterId]);

  const saveToHistory = (
    cId: string,
    cTitle: string,
    cCover: string,
    chId: string,
    chNum: string
  ) => {
    const saved = localStorage.getItem("comiharth-history");
    let historyList: any[] = [];
    
    if (saved) {
      try {
        historyList = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    // Remove existing item for this comic
    historyList = historyList.filter((item) => item.comicId !== cId);

    // Insert new item at the front
    historyList.unshift({
      comicId: cId,
      comicTitle: cTitle,
      comicCover: cCover,
      provider: provider,
      chapterId: chId,
      chapterNumber: chNum,
      lastReadAt: new Date().toISOString()
    });

    localStorage.setItem("comiharth-history", JSON.stringify(historyList));
  };

  const handlePreferencesChange = (newPrefs: ReaderPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem("comiharth-reader-prefs", JSON.stringify(newPrefs));
  };

  // Determine width styling classes
  const getWidthClass = () => {
    switch (preferences.width) {
      case "fit":
        return "w-full max-w-none";
      case "720px":
        return "max-w-[720px]";
      case "1200px":
        return "max-w-[1200px]";
      case "900px":
      default:
        return "max-w-[900px]";
    }
  };

  // Determine background color based on reading preference
  const getThemeClass = () => {
    switch (preferences.theme) {
      case "gray":
        return "bg-zinc-800 text-zinc-100";
      case "black":
        return "bg-black text-zinc-400";
      case "white":
      default:
        return "bg-white text-zinc-950";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-40 gap-4 bg-background transition-colors duration-300">
        <Loader2 className="h-8 w-8 text-accent-green animate-spin" />
        <p className="text-xs text-muted-text font-semibold">Scraping comic panel streams and descrambling buffers...</p>
      </div>
    );
  }

  if (error || !pagesData) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 bg-background text-center transition-colors duration-300">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 max-w-md text-red-400 mb-6">
          <p className="font-bold text-base mb-1">Scraper Error</p>
          <p className="text-xs">{error || "Failed to render pages stream"}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 h-11 rounded-xl bg-accent-green hover:bg-green-600 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Connection</span>
          </button>
          <Link
            href={`/comic/${provider}/${comicId}`}
            className="flex items-center justify-center px-6 h-11 rounded-xl bg-surface border border-border-dark text-xs font-bold text-foreground transition-colors cursor-pointer"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${getThemeClass()} transition-colors duration-300 min-h-screen relative`}>
      {/* 1. Header Toolbar */}
      <ReaderToolbar
        comicTitle={comic?.title || "Manga"}
        comicId={comicId}
        provider={provider}
        chapters={chapters}
        currentChapterId={chapterId}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Reader Settings popover */}
      <ReaderSettings
        preferences={preferences}
        onChange={handlePreferencesChange}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 3. Panel Container */}
      <div className={`flex-1 flex flex-col items-center justify-start ${preferences.mode === "vertical" ? "py-0 px-0" : "py-6 px-1"}`}>
        
        {/* Webtoon Mode: Vertical Stack */}
        {preferences.mode === "vertical" ? (
          <div className={`w-full flex flex-col gap-0 mx-auto ${getWidthClass()}`}>
            {pagesData.pages.map((pageUrl, idx) => (
              <div key={idx} className="w-full relative bg-transparent flex items-center justify-center">
                <img
                  src={pageUrl}
                  alt={`Page ${idx + 1}`}
                  loading={idx < 2 ? "eager" : "lazy"}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto block border-none p-0 m-0"
                  onError={(e) => {
                    const imgTarget = e.currentTarget;
                    imgTarget.onerror = null;
                    imgTarget.src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=800&auto=format&fit=crop&q=80";
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Manga Mode: Single Page pagination clicker */
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 py-4 px-2">
            
            {/* Image display */}
            <div className="relative w-full max-w-[700px] aspect-[2/3] bg-surface-hover/40 rounded-2xl overflow-hidden border border-border-dark/20 flex items-center justify-center">
              <img
                src={pagesData.pages[currentPageIndex]}
                alt={`Page ${currentPageIndex + 1}`}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
              
              {/* Invisible click targets */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1/3 cursor-w-resize" 
                onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              />
              <div 
                className="absolute right-0 top-0 bottom-0 w-1/3 cursor-e-resize" 
                onClick={() => setCurrentPageIndex((prev) => Math.min(pagesData.pages.length - 1, prev + 1))}
              />
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <button
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex((prev) => prev - 1)}
                className="p-2.5 h-10 rounded-xl bg-surface hover:bg-surface-hover border border-border-dark text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              
              <span className="text-muted-text px-4">
                Page <span className="text-foreground font-extrabold">{currentPageIndex + 1}</span> of <span className="text-foreground">{pagesData.pages.length}</span>
              </span>

              <button
                disabled={currentPageIndex === pagesData.pages.length - 1}
                onClick={() => setCurrentPageIndex((prev) => prev + 1)}
                className="p-2.5 h-10 rounded-xl bg-surface hover:bg-surface-hover border border-border-dark text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 4. Bottom Navigation Arrows */}
      <div className="border-t border-border-dark/25 w-full bg-surface/30">
        <ChapterNavigation
          provider={provider}
          comicId={comicId}
          nextChapterId={pagesData.nextChapterId}
          previousChapterId={pagesData.previousChapterId}
        />
      </div>

    </div>
  );
}
