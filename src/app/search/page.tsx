"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useMemo } from "react";
import { ComicSearchResult } from "@/lib/providers/types";
import ComicGrid from "@/components/comic/ComicGrid";
import { Search, Compass, Loader2, SlidersHorizontal, RotateCcw, Check, ArrowUpDown } from "lucide-react";

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

  // Filter & Sort States
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");

  // Sync states when query parameters change
  useEffect(() => {
    setActiveProvider(providerParam);
  }, [providerParam]);

  useEffect(() => {
    setInputVal(query);

    const performSearch = async () => {
      setIsLoading(true);
      setError("");
      try {
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

  // ⚡ Client-side Instant Filter & Sort calculation
  const processedResults = useMemo(() => {
    let list = [...results];

    // 1. Filter by Type
    if (selectedType !== "all") {
      list = list.filter((item) => item.type === selectedType);
    }

    // 2. Filter by Status
    if (selectedStatus !== "all") {
      list = list.filter((item) => item.status === selectedStatus);
    }

    // 3. Apply Sorting
    if (sortBy === "title-asc") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      list.sort((a, b) => b.title.localeCompare(a.title));
    }

    return list;
  }, [results, selectedType, selectedStatus, sortBy]);

  // Active filter counter
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== "all") count++;
    if (selectedStatus !== "all") count++;
    if (sortBy !== "relevance") count++;
    return count;
  }, [selectedType, selectedStatus, sortBy]);

  const handleResetFilters = () => {
    setSelectedType("all");
    setSelectedStatus("all");
    setSortBy("relevance");
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

      {/* Input Box & Filter Toggle */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <form onSubmit={handleSubmit} className="w-full relative flex-1">
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

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 h-12 px-5 rounded-2xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            showFilters || activeFiltersCount > 0
              ? "bg-accent-green/5 border-accent-green text-accent-green shadow-sm shadow-green-500/5"
              : "bg-surface border-border-dark/60 text-muted-text hover:text-foreground hover:border-zinc-400"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-green px-1.5 text-[10px] font-extrabold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Expandable Glassmorphic Filter Drawer */}
      {showFilters && (
        <div className="glass rounded-2xl p-6 flex flex-col gap-6 glow-green-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between border-b border-border-dark/40 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Filter Catalog
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Format (Type) Filter */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-extrabold text-muted-text uppercase tracking-widest">
                Format
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["all", "manga", "manhwa", "manhua"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`h-9 px-4 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedType === t
                        ? "bg-accent-green/10 border-accent-green text-accent-green border"
                        : "bg-surface-hover/50 text-muted-text border border-border-dark/40 hover:text-foreground"
                    }`}
                  >
                    {selectedType === t && <Check className="h-3 w-3" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-extrabold text-muted-text uppercase tracking-widest">
                Status
              </span>
              <div className="flex flex-wrap gap-1.5">
                {["all", "ongoing", "completed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    className={`h-9 px-4 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedStatus === s
                        ? "bg-accent-green/10 border-accent-green text-accent-green border"
                        : "bg-surface-hover/50 text-muted-text border border-border-dark/40 hover:text-foreground"
                    }`}
                  >
                    {selectedStatus === s && <Check className="h-3 w-3" />}
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting Filter */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-extrabold text-muted-text uppercase tracking-widest">
                Sort Results
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "relevance", label: "Relevance" },
                  { value: "title-asc", label: "Title A-Z" },
                  { value: "title-desc", label: "Title Z-A" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`h-9 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      sortBy === opt.value
                        ? "bg-accent-green/10 border-accent-green text-accent-green border"
                        : "bg-surface-hover/50 text-muted-text border border-border-dark/40 hover:text-foreground"
                    }`}
                  >
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Results Header Info */}
      <div className="flex items-center justify-between text-xs text-muted-text font-bold border-b border-border-dark/20 pb-4">
        <div>
          {query ? (
            <span>
              Search results for <span className="text-foreground">"{query}"</span>
            </span>
          ) : (
            <span>Browsing index catalog</span>
          )}
          <span> using </span>
          <span className="text-accent-green uppercase font-extrabold">{activeProvider}</span>
        </div>

        <div>
          Found <span className="text-foreground font-extrabold">{processedResults.length}</span> titles
        </div>
      </div>

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
      ) : processedResults.length === 0 ? (
        <div className="rounded-2xl border border-border-dark/40 bg-surface/30 p-12 text-center flex flex-col items-center gap-2">
          <Search className="h-8 w-8 text-muted-text/40" />
          <p className="text-sm text-muted-text font-bold">No results matches your criteria.</p>
          <p className="text-xs text-zinc-500 font-medium">
            Try adjusting your active filters or clear them to view more items.
          </p>
        </div>
      ) : (
        <ComicGrid comics={processedResults} />
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
