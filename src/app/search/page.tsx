"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useMemo } from "react";
import { ComicSearchResult } from "@/lib/providers/types";
import ComicGrid from "@/components/comic/ComicGrid";
import { Search, Compass, Loader2, SlidersHorizontal, RotateCcw, Check, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const providerParam = searchParams.get("provider") || searchParams.get("source");
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const formatParam = searchParams.get("format") || "all";
  const genreParam = searchParams.get("genre") || "all";
  const statusParam = searchParams.get("status") || "all";
  const sortParam = searchParams.get("sort") || "latest";

  const [inputVal, setInputVal] = useState(query);
  const [activeProvider, setActiveProvider] = useState(() => {
    if (typeof window !== "undefined") {
      return providerParam || localStorage.getItem("comic-source") || "shinigami";
    }
    return providerParam || "shinigami";
  });
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [selectedType, setSelectedType] = useState<string>(formatParam);
  const [selectedGenre, setSelectedGenre] = useState<string>(genreParam);
  const [selectedStatus, setSelectedStatus] = useState<string>(statusParam);
  const [sortBy, setSortBy] = useState<string>(sortParam);
  const [results, setResults] = useState<ComicSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter & Sort States
  const [showFilters, setShowFilters] = useState(false);
  const [komikcastGenres, setKomikcastGenres] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (activeProvider === "komikcast" && komikcastGenres.length === 0) {
      fetch("/api/search?action=genres&provider=komikcast")
        .then((res) => res.json())
        .then((json) => {
          if (json.data && Array.isArray(json.data)) {
            const genres = json.data
              .filter((g: any) => g && g.id && g.data && g.data.name)
              .map((g: any) => ({
                id: g.id.toString(),
                name: g.data.name,
              }))
              .sort((a: any, b: any) => a.name.localeCompare(b.name));
            console.log("Successfully mapped genres:", genres.length);
            setKomikcastGenres(genres);
          } else {
            console.error("Invalid response format:", json);
          }
        })
        .catch((err) => console.error("Failed to fetch komikcast genres catch:", err));
    }
  }, [activeProvider, komikcastGenres.length]);

  // Sync states when URL parameters change
  useEffect(() => {
    if (providerParam) setActiveProvider(providerParam);
    setCurrentPage(pageParam);
    setSelectedType(formatParam);
    setSelectedGenre(genreParam);
    setSelectedStatus(statusParam);
    setSortBy(sortParam);
  }, [providerParam, pageParam, formatParam, genreParam, statusParam, sortParam]);

  useEffect(() => {
    setInputVal(query);

    const performSearch = async () => {
      setIsLoading(true);
      setError("");
      try {
        const searchVal = query.trim();
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchVal)}&provider=${activeProvider}&page=${currentPage}&format=${selectedType}&genre=${selectedGenre}&status=${selectedStatus}&sort=${sortBy}`
        );
        
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setResults(json.data);
            setTotalCount(json.totalCount ?? null);
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
  }, [query, activeProvider, currentPage, selectedType, selectedGenre, selectedStatus, sortBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(inputVal.trim())}&provider=${activeProvider}&page=1&format=${selectedType}&genre=${selectedGenre}&status=${selectedStatus}&sort=${sortBy}`);
  };

  const handleProviderChange = (prov: string) => {
    setActiveProvider(prov);
    router.push(`/search?q=${encodeURIComponent(inputVal.trim())}&provider=${prov}&page=1&format=${selectedType}&genre=${selectedGenre}&status=${selectedStatus}&sort=${sortBy}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/search?q=${encodeURIComponent(query)}&provider=${activeProvider}&page=${newPage}&format=${selectedType}&genre=${selectedGenre}&status=${selectedStatus}&sort=${sortBy}`);
  };

  const handleTypeChange = (t: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&provider=${activeProvider}&page=1&format=${t}&genre=${selectedGenre}&status=${selectedStatus}&sort=${sortBy}`);
  };

  const handleGenreChange = (g: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&provider=${activeProvider}&page=1&format=${selectedType}&genre=${g}&status=${selectedStatus}&sort=${sortBy}`);
  };

  const handleStatusChange = (s: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&provider=${activeProvider}&page=1&format=${selectedType}&genre=${selectedGenre}&status=${s}&sort=${sortBy}`);
  };

  const handleSortChange = (so: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&provider=${activeProvider}&page=1&format=${selectedType}&genre=${selectedGenre}&status=${selectedStatus}&sort=${so}`);
  };

  const handleResetFilters = () => {
    setSelectedStatus("all");
    setSortBy("latest");
    setSelectedGenre("all");
    router.push(`/search?q=${encodeURIComponent(query)}&provider=${activeProvider}&page=1&format=all&genre=all&status=all&sort=latest`);
  };

  // Active filter counter
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== "all") count++;
    if (selectedGenre !== "all") count++;
    if (selectedStatus !== "all") count++;
    if (sortBy !== "latest") count++;
    return count;
  }, [selectedType, selectedGenre, selectedStatus, sortBy]);

  // Dynamic Pagination Boundary: Shinigami serves 24 items per page
  const hasNextPage = results.length === 24;

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

        {/* Provider Toggle Pills Removed as requested */}
      </div>

      {/* Input Box & Filter Toggle */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <form onSubmit={handleSubmit} className="w-full relative flex-1">
          <input
            type="text"
            placeholder={`Search comics, manhwa, manga on ${
              activeProvider === "shinigami" 
                ? "Shinigami" 
                : activeProvider === "komikcast" 
                ? "Komikcast" 
                : activeProvider
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

      {/* Premium Filter Drawer */}
      {showFilters && (
        <div className="relative overflow-hidden rounded-3xl bg-surface/40 backdrop-blur-xl border border-border-dark/60 p-6 md:p-8 flex flex-col gap-8 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
          
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-green/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between border-b border-border-dark/40 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-accent-green/20 flex items-center justify-center border border-accent-green/30">
                <SlidersHorizontal className="h-4.5 w-4.5 text-accent-green" />
              </div>
              <h3 className="text-sm md:text-base font-display font-extrabold uppercase tracking-widest text-foreground">
                Advanced Filtering
              </h3>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}
          </div>

          <div className="relative z-10 flex flex-col gap-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Format Filter */}
              <div className="flex flex-col gap-3.5">
                <span className="flex items-center gap-2 text-[11px] font-extrabold text-muted-text uppercase tracking-widest">
                  Comic Format
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "All Formats" },
                    { id: "manga", label: "Manga (JP)" },
                    { id: "manhwa", label: "Manhwa (KR)" },
                    { id: "manhua", label: "Manhua (CN)" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTypeChange(t.id)}
                      className={`h-10 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        selectedType === t.id
                          ? "bg-accent-green text-white"
                          : "bg-background/80 border border-border-dark/60 text-muted-text hover:bg-surface-hover hover:text-foreground hover:border-border-dark"
                      }`}
                    >
                      {selectedType === t.id && <Check className="h-3.5 w-3.5" />}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col gap-3.5">
                <span className="flex items-center gap-2 text-[11px] font-extrabold text-muted-text uppercase tracking-widest">
                  Release Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {["all", "ongoing", "completed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`h-10 px-4 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer flex items-center gap-2 ${
                        selectedStatus === s
                          ? "bg-accent-green text-white"
                          : "bg-background/80 border border-border-dark/60 text-muted-text hover:bg-surface-hover hover:text-foreground hover:border-border-dark"
                      }`}
                    >
                      {selectedStatus === s && <Check className="h-3.5 w-3.5" />}
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Sorting Filter */}
              <div className="flex flex-col gap-3.5">
                <span className="flex items-center gap-2 text-[11px] font-extrabold text-muted-text uppercase tracking-widest">
                  Sort Results
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "latest", label: "Recently Updated" },
                    { value: "relevance", label: "Relevance" },
                    { value: "trending", label: "Trending" },
                    { value: "popular", label: "Popular" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`h-10 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        sortBy === opt.value
                          ? "bg-accent-green text-white"
                          : "bg-background/80 border border-border-dark/60 text-muted-text hover:bg-surface-hover hover:text-foreground hover:border-border-dark"
                      }`}
                    >
                      {sortBy === opt.value && <Check className="h-3.5 w-3.5" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre Filter */}
              <div className="flex flex-col gap-3.5">
                <span className="flex items-center gap-2 text-[11px] font-extrabold text-muted-text uppercase tracking-widest">
                  Genres
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleGenreChange("all")}
                    className={`h-9 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedGenre === "all"
                        ? "bg-accent-green text-white"
                        : "bg-background/80 border border-border-dark/60 text-muted-text hover:bg-surface-hover hover:text-foreground hover:border-border-dark"
                    }`}
                  >
                    {selectedGenre === "all" && <Check className="h-3 w-3" />}
                    All
                  </button>

                  {activeProvider === "komikcast" ? (
                    komikcastGenres.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => handleGenreChange(g.name)}
                        className={`h-9 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedGenre === g.name
                            ? "bg-accent-green text-white"
                            : "bg-background/80 border border-border-dark/60 text-muted-text hover:bg-surface-hover hover:text-foreground hover:border-border-dark"
                        }`}
                      >
                        {selectedGenre === g.name && <Check className="h-3 w-3" />}
                        {g.name}
                      </button>
                    ))
                  ) : (
                    [
                      "action", "adventure", "comedy", "drama", 
                      "fantasy", "romance", "sci-fi", "isekai", "slice-of-life", "thriller"
                    ].map((g) => (
                      <button
                        key={g}
                        onClick={() => handleGenreChange(g)}
                        className={`h-9 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedGenre === g
                            ? "bg-accent-green text-white"
                            : "bg-background/80 border border-border-dark/60 text-muted-text hover:bg-surface-hover hover:text-foreground hover:border-border-dark"
                        }`}
                      >
                        {selectedGenre === g && <Check className="h-3 w-3" />}
                        {g.replace("-", " ")}
                      </button>
                    ))
                  )}
                </div>
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
          Found <span className="text-foreground font-extrabold">{totalCount ? (totalCount >= 1000 ? "1000+" : totalCount) : results.length}</span> titles
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
      ) : results.length === 0 ? (
        <div className="rounded-2xl border border-border-dark/40 bg-surface/30 p-12 text-center flex flex-col items-center gap-2">
          <Search className="h-8 w-8 text-muted-text/40" />
          <p className="text-sm text-muted-text font-bold">No results matches your criteria.</p>
          <p className="text-xs text-zinc-500 font-medium">
            Try adjusting your active filters or clear them to view more items.
          </p>
        </div>
      ) : (
        <>
          <ComicGrid comics={results} />

          {/* Premium Pagination Component Shelf */}
          <div className="mt-8 flex items-center justify-center gap-4 border-t border-border-dark/20 pt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className={`flex items-center gap-1.5 h-10 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                currentPage <= 1
                  ? "opacity-40 bg-zinc-100/5 text-zinc-500 border-zinc-200/10 cursor-not-allowed"
                  : "bg-surface border-border-dark/60 text-foreground hover:text-accent-green hover:border-accent-green/30"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="flex h-10 px-4 items-center justify-center rounded-xl bg-surface border border-border-dark/40 text-xs font-bold text-foreground">
              Page {currentPage}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage || isLoading}
              className={`flex items-center gap-1.5 h-10 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                !hasNextPage
                  ? "opacity-40 bg-zinc-100/5 text-zinc-500 border-zinc-200/10 cursor-not-allowed"
                  : "bg-surface border-border-dark/60 text-foreground hover:text-accent-green hover:border-accent-green/30"
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
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
