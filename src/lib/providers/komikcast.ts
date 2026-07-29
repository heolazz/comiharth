import { MangaProvider, ComicSearchResult, ComicDetail, Chapter, ChapterPages } from "./types";

const GAS_PROXY_URL = "https://script.google.com/macros/s/AKfycbxcSrY6mQ_hHBvsMk9Qs96BwK5vVImJg6h3zCMGHE3HEBS-g089sMO5wprVHk2bydTPTA/exec";
const KOMIKCAST_BASE_URL = "https://be.komikcast.cc";

async function fetchKomikcast<T>(path: string): Promise<T> {
  const targetUrl = `${KOMIKCAST_BASE_URL}${path}`;
  const isDev = process.env.NODE_ENV === "development";
  const url = isDev ? targetUrl : `${GAS_PROXY_URL}?url=${encodeURIComponent(targetUrl)}`;
  const res = await fetch(url, {
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    throw new Error(`Komikcast API error: ${res.status}`);
  }

  const json = await res.json();
  if (!isDev && json.error) {
    throw new Error(`Proxy error: ${json.error}`);
  }

  return json;
}

function getComicType(format?: string): "manga" | "manhwa" | "manhua" | "comic" | "unknown" {
  if (!format) return "unknown";
  const lowerFormat = format.toLowerCase();
  if (lowerFormat.includes("manga")) return "manga";
  if (lowerFormat.includes("manhwa")) return "manhwa";
  if (lowerFormat.includes("manhua")) return "manhua";
  return "comic";
}

export const komikcastProvider: MangaProvider = {
  name: "komikcast",

  async search(query: string, page = 1, format?: string, genre?: string, status?: string, sort?: string): Promise<{ results: ComicSearchResult[], totalCount?: number }> {
    try {
      // Build search params dynamically based on user's recommended explore structure
      const params = new URLSearchParams();
      params.append("takeChapter", "2");
      params.append("includeMeta", "true");
      params.append("take", "24");
      params.append("page", String(page));
      
      if (query) params.append("title", query);
      
      // Defaults to latest update sort, like the explore page
      if (sort === "popular") {
        params.append("sort", "popular");
        params.append("sortOrder", "desc");
      } else {
        params.append("sort", "latest");
        params.append("sortOrder", "desc");
      }

      if (format && format.toLowerCase() !== "all") params.append("format", format);
      if (status && status.toLowerCase() !== "all") params.append("status", status);
      if (genre && genre.toLowerCase() !== "all") params.append("genreIds", genre);

      const json = await fetchKomikcast<any>(`/series?${params.toString()}`);
      
      const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      
      const results: ComicSearchResult[] = items.map((item: any) => {
        const data = item.data || {};
        const chapterNum = item.chapters?.[0]?.chapterIndex ?? item.chapters?.[0]?.data?.index ?? data.totalChapters ?? data.chapterIndex ?? data.index;
        
        return {
          id: data.slug || String(item.id),
          provider: "komikcast",
          title: data.title,
          altTitles: data.nativeTitle ? [data.nativeTitle] : [],
          cover: data.coverImage || data.thumbnail || "",
          type: getComicType(data.format),
          status: data.status?.toLowerCase() === "ongoing" ? "ongoing" : "completed",
          latestChapter: chapterNum ? `Chapter ${chapterNum}` : "",
        };
      });

      return { results, totalCount: json.meta?.total || results.length };
    } catch (e) {
      console.warn("Komikcast search failed, returning empty", e);
      return { results: [] };
    }
  },

  async getDetails(id: string): Promise<ComicDetail> {
    const json = await fetchKomikcast<any>(`/series/${id}?includeMeta=true`);
    const item = json.data ?? json;
    const data = item.data || item;
    
    return {
      id: data.slug || String(item.id),
      provider: "komikcast",
      title: data.title,
      altTitles: data.nativeTitle ? [data.nativeTitle] : [],
      cover: data.coverImage || "",
      banner: data.backgroundImage || "",
      description: data.synopsis || "",
      type: getComicType(data.format),
      status: data.status?.toLowerCase() === "ongoing" ? "ongoing" : "completed",
      author: data.author ? [data.author] : [],
      artist: [],
      genres: Array.isArray(data.genres) 
        ? data.genres.map((g: any) => g.data?.name || g.name).filter(Boolean) 
        : [],
      rating: typeof data.rating === "number" ? data.rating : Number(data.rating) || 0,
      chaptersCount: data.totalChapters ? Number(data.totalChapters) : undefined,
    };
  },

  async getChapters(id: string): Promise<Chapter[]> {
    const json = await fetchKomikcast<any>(`/series/${id}/chapters`);
    const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    
    return items.map((chapter: any) => {
      const data = chapter.data || {};
      const chapterNumber = String(chapter.chapterIndex ?? data.chapterIndex ?? data.number ?? "");
      
      return {
        id: chapterNumber, // For komikcast, we use chapterNumber to query chapter detail
        provider: "komikcast",
        comicId: id,
        title: data.title || `Chapter ${chapterNumber}`,
        chapterNumber: chapterNumber,
        createdAt: chapter.createdAt || data.createdAt,
      };
    });
  },

  async getPages(chapterId: string): Promise<ChapterPages> {
    // the chapterId passed here will be the combined string or just chapterNumber depending on how it's called.
    // wait, getPages usually just takes chapterId. For komikcast, the endpoint is /series/{slug}/chapters/{chapterNumber}.
    // So we need to encode both slug and chapterNumber into the chapterId string, e.g. "slug::chapterNumber"
    // Let's modify getChapters to return "slug::chapterNumber" as the ID.
    // Wait, the interface says `getPages(chapterId: string)`.
    throw new Error("getPages for Komikcast requires both slug and chapterNumber. Call it properly from the route.");
  }
};

// Overriding getPages implementation for Komikcast using a custom structure 
// We encode chapter ID as slug~chapterNumber (using ~ separator, same as Shinigami)
export const komikcastProviderPagesAdapter = {
  ...komikcastProvider,
  async getChapters(id: string): Promise<Chapter[]> {
    const json = await fetchKomikcast<any>("/series/" + id + "/chapters");
    const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    
    return items.map((chapter: any) => {
      const data = chapter.data || {};
      const chapterNumber = String(chapter.chapterIndex ?? data.chapterIndex ?? data.number ?? data.index ?? "");
      
      return {
        id: id + "~" + chapterNumber, // Encoded as slug~chapterNumber
        provider: "komikcast",
        comicId: id,
        title: data.title || "Chapter " + chapterNumber,
        chapterNumber: chapterNumber,
        createdAt: chapter.createdAt || data.createdAt,
      };
    });
  },

  async getPages(encodedId: string): Promise<ChapterPages> {
    // Format: slug~chapterNumber
    const tildeIndex = encodedId.lastIndexOf("~");
    if (tildeIndex === -1) {
      throw new Error("Invalid chapter ID for Komikcast. Must be slug~chapterNumber");
    }
    const slug = encodedId.substring(0, tildeIndex);
    const chapterNumber = encodedId.substring(tildeIndex + 1);
    
    if (!slug || !chapterNumber) {
      throw new Error("Invalid chapter ID for Komikcast. slug and chapterNumber are required");
    }

    // Fetch pages
    const json = await fetchKomikcast<any>("/series/" + slug + "/chapters/" + chapterNumber);
    const chapter = json.data ?? json;
    
    let pages: string[] = [];
    if (chapter.data?.images && Array.isArray(chapter.data.images)) {
      pages = chapter.data.images;
    } else if (chapter.images && Array.isArray(chapter.images)) {
      pages = chapter.images;
    } else if (chapter.dataImages) {
      const dataImages = chapter.dataImages || {};
      const sortedKeys = Object.keys(dataImages).sort((a, b) => Number(a) - Number(b));
      pages = sortedKeys.map(k => dataImages[k]).filter(Boolean) as string[];
    }

    // Pass images through local proxy to bypass hotlink protection
    pages = pages.map(url => `/api/proxy-image?url=${encodeURIComponent(url)}&referer=${encodeURIComponent("https://komikcast.cc/")}`);

    // Fetch chapters list to determine next/prev
    let nextChapterId: string | undefined = undefined;
    let previousChapterId: string | undefined = undefined;
    
    try {
      const chaptersListRes = await fetchKomikcast<any>("/series/" + slug + "/chapters");
      const items = Array.isArray(chaptersListRes.data) ? chaptersListRes.data : (Array.isArray(chaptersListRes) ? chaptersListRes : []);
      
      // Items are usually sorted newest first (descending). So index 0 is newest.
      const currentIndex = items.findIndex((c: any) => {
        const cNum = String(c.chapterIndex ?? c.data?.chapterIndex ?? c.data?.number ?? c.data?.index ?? "");
        return cNum === chapterNumber;
      });

      if (currentIndex !== -1) {
        // Next chapter is the one before it in the descending list
        if (currentIndex > 0) {
          const nextC = items[currentIndex - 1];
          const nextNum = String(nextC.chapterIndex ?? nextC.data?.chapterIndex ?? nextC.data?.number ?? nextC.data?.index ?? "");
          if (nextNum) nextChapterId = slug + "~" + nextNum;
        }
        // Prev chapter is the one after it in the descending list
        if (currentIndex < items.length - 1) {
          const prevC = items[currentIndex + 1];
          const prevNum = String(prevC.chapterIndex ?? prevC.data?.chapterIndex ?? prevC.data?.number ?? prevC.data?.index ?? "");
          if (prevNum) previousChapterId = slug + "~" + prevNum;
        }
      }
    } catch (e) {
      console.error("Failed to fetch chapters list for next/prev calculation", e);
    }

    return {
      chapterId: encodedId,
      provider: "komikcast",
      pages,
      nextChapterId,
      previousChapterId,
    };
  }
};

// Replace with adapter
export const finalKomikcastProvider = komikcastProviderPagesAdapter;
