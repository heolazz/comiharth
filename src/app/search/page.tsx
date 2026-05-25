"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ComicSearchResult } from "@/lib/providers/types";
import ComicGrid from "@/components/comic/ComicGrid";
import { Search, Compass, Loader2 } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const providerParam = searchParams.get("provider") || "shinigami";

  const [inputVal, setInputVal] = useState(query);
  const [activeProvider, setActiveProvider] = useState(providerParam);
  const [results, setResults] = useState<ComicSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync active provider state if URL parameter changes
  useEffect(() => {
    setActiveProvider(providerParam);
  }, [providerParam]);

  useEffect(() => {
    setInputVal(query);

    const performSearch = async () => {
      setIsLoading(true);
      setError("");
      try {
        // If query is empty, run a fallback general query like "a" to populate a beautiful initial explorer list
        const searchVal = query.trim() || "a";
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchVal)}&provider=${activeProvider}`);
        
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setResults(json.data);
          } else {
            setError(json.error?.message || "Search failed");
          }
        } else {
          setError("Failed to fetch search results from server");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, activeProvider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(inputVal.trim())}&provider=${activeProvider}`);
  };

  const handleProviderChange = (prov: string) => {
    setActiveProvider(prov);
    router.push(`/search?q=${encodeURIComponent(inputVal.trim())}&provider=${prov}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 py-10 flex flex-col gap-8 transition-colors duration-300">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground flex items-center gap-2">
            <Compass className="h-6 w-6 text-accent-green" />
            Explore & Discover
          </h1>
          <p className="text-xs text-muted-text font-medium">
            Browse through all genres, webtoons, manhwa, and chapters.
          </p>
        </div>

        {/* Dynamic Provider Toggle Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface border border-border-dark/40 self-start shadow-sm">
          <button
            onClick={() => handleProviderChange("shinigami")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeProvider === "shinigami"
                ? "bg-accent-green text-white shadow-sm"
                : "text-muted-text hover:text-foreground"
            }`}
          >
            Shinigami (Indonesian)
          </button>
          <button
            onClick={() => handleProviderChange("mangadex")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeProvider === "mangadex"
                ? "bg-accent-green text-white shadow-sm"
                : "text-muted-text hover:text-foreground"
            }`}
          >
            MangaDex (English)
          </button>
          <button
            onClick={() => handleProviderChange("mangafire")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeProvider === "mangafire"
                ? "bg-accent-green text-white shadow-sm"
                : "text-muted-text hover:text-foreground"
            }`}
          >
            MangaFire (Local)
          </button>
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="w-full relative">
        <input
          type="text"
          placeholder={`Search comics, manhwa, manga on ${
            activeProvider === "shinigami" 
              ? "Shinigami" 
              : activeProvider === "mangadex" 
              ? "MangaDex" 
              : "MangaFire"
          }...`}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="w-full h-12 rounded-2xl bg-surface border border-border-dark/60 pl-12 pr-6 text-sm text-foreground placeholder-muted-text/60 focus:outline-none focus:border-accent-green/70 focus:ring-1 focus:ring-accent-green/70 transition-all shadow-sm"
        />
        <Search className="absolute left-4.5 top-4 h-4 w-4 text-muted-text/50" />
      </form>

      {/* Results Header */}
      {query && (
        <div className="text-sm font-semibold text-muted-text">
          Search results for <span className="text-foreground">"{query}"</span> using <span className="text-accent-green font-extrabold uppercase">{activeProvider}</span>:
        </div>
      )}

      {/* States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-accent-green animate-spin" />
          <p className="text-xs text-muted-text font-semibold">Fetching matching manga indices...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-400">
          {error}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-border-dark/40 bg-surface/30 p-12 text-center flex flex-col items-center gap-2">
          <Search className="h-8 w-8 text-muted-text/40" />
          <p className="text-sm text-muted-text font-bold">No results matches your criteria.</p>
          <p className="text-xs text-zinc-500 font-medium">Try searching for other popular terms like "solo", "piece", or "chainsaw".</p>
        </div>
      ) : (
        <ComicGrid comics={results} />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 text-accent-green animate-spin" />
        <p className="text-xs text-muted-text font-semibold">Loading search canvas...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
