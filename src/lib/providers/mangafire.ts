import { MangaProvider, ComicSearchResult, ComicDetail, Chapter, ChapterPages } from "./types";

// High-quality mock data for robust fallback
const MOCK_COMICS: ComicDetail[] = [
  {
    id: "solo-leveling",
    provider: "mangafire",
    title: "Solo Leveling",
    altTitles: ["Na Honjaman Level Up", "Only I Level Up"],
    cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80",
    description: "In a world where hunters must battle deadly monsters to protect mankind, Sung Jinwoo, the weakest hunter of all, finds himself in a life-or-death struggle inside a double dungeon. Surviving the ordeal grants him a mysterious system that allows him to level up without limit. Follow Jinwoo as he rises from the bottom to become the strongest hunter in existence.",
    type: "manhwa",
    status: "completed",
    author: ["Chugong"],
    artist: ["DUBU (Redice Studio)"],
    genres: ["Action", "Adventure", "Fantasy", "System"],
    year: "2018",
    rating: 9.8,
    chaptersCount: 179
  },
  {
    id: "one-piece",
    provider: "mangafire",
    title: "One Piece",
    altTitles: ["OP"],
    cover: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1600&auto=format&fit=crop&q=80",
    description: "Gol D. Roger was known as the 'Pirate King,' the strongest and most infamous being to have sailed the Grand Line. The capture and execution of Roger by the World Government brought a change throughout the world. His last words before his death revealed the existence of the greatest treasure in the world, One Piece. Enter Monkey D. Luffy, a 17-year-old boy who defies your standard definition of a pirate.",
    type: "manga",
    status: "ongoing",
    author: ["Eiichiro Oda"],
    artist: ["Eiichiro Oda"],
    genres: ["Action", "Adventure", "Comedy", "Fantasy", "Shounen"],
    year: "1997",
    rating: 9.6,
    chaptersCount: 1110
  },
  {
    id: "chainsaw-man",
    provider: "mangafire",
    title: "Chainsaw Man",
    altTitles: ["CSM"],
    cover: "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80",
    description: "Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind, he has been living a rock-bottom life while repaying his debt by harvesting devil carcasses with Pochita. One day, Denji is betrayed and killed. As his consciousness fades, he makes a contract with Pochita and revives as 'Chainsaw Man'—a man with a devil's heart.",
    type: "manga",
    status: "ongoing",
    author: ["Tatsuki Fujimoto"],
    artist: ["Tatsuki Fujimoto"],
    genres: ["Action", "Comedy", "Dark Fantasy", "Gore"],
    year: "2018",
    rating: 9.4,
    chaptersCount: 160
  },
  {
    id: "tower-of-god",
    provider: "mangafire",
    title: "Tower of God",
    altTitles: ["Sin-ui Tap"],
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80",
    description: "What do you desire? Money and wealth? Honor and pride? Authority and power? Revenge? Or something that transcends all of them? Whatever you desire—it is here at the top of the Tower. Twenty-Fifth Bam, a boy who has lived alone in a dark cave beneath the Tower, climbs in search of his dear friend Rachel, who entered the Tower to see the stars.",
    type: "manhwa",
    status: "ongoing",
    author: ["SIU"],
    artist: ["SIU"],
    genres: ["Action", "Adventure", "Fantasy", "Mystery"],
    year: "2010",
    rating: 9.2,
    chaptersCount: 620
  }
];

const getMockPages = (comicId: string, chapterNumber: string): string[] => {
  const imageIds = [
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=90",
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=90"
  ];
  return imageIds;
};

export class MangaFireProvider implements MangaProvider {
  name = "mangafire";
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MANGAFIRE_API_BASE_URL || "";
  }

  async search(query: string, page = 1): Promise<ComicSearchResult[]> {
    if (this.baseUrl) {
      try {
        const response = await fetch(`${this.baseUrl}/api/search/${encodeURIComponent(query)}?page=${page}`, {
          next: { revalidate: 300 }
        });
        if (response.ok) {
          const json = await response.json();
          let results: any[] = [];
          
          if (json && Array.isArray(json.results)) {
            results = json.results;
          } else if (json && json.success && Array.isArray(json.data)) {
            results = json.data;
          } else if (Array.isArray(json)) {
            results = json;
          }

          if (results.length > 0) {
            return results.map((item: any) => {
              const coverUrl = item.poster || item.cover || "";
              // Handle proxies or direct URLs
              const finalCover = coverUrl.startsWith("/") ? `${this.baseUrl}${coverUrl}` : coverUrl;
              
              return {
                id: item.id || "",
                provider: "mangafire",
                title: item.title || item.name || "",
                altTitles: item.altTitles ? [item.altTitles] : [],
                cover: finalCover,
                type: item.type ? item.type.toLowerCase() as any : "manga",
                status: item.status ? item.status.toLowerCase() as any : "ongoing",
                latestChapter: item.latestChapter || (item.chapters && item.chapters[0] ? `Chapter ${item.chapters[0].chapter}` : undefined),
                url: item.url
              };
            });
          }
        }
      } catch (error) {
        console.warn("MangaFire API search failed, falling back to mock data:", error);
      }
    }

    // High fidelity local mock search
    const lowerQuery = query.toLowerCase();
    const filtered = MOCK_COMICS.filter(
      comic =>
        comic.title.toLowerCase().includes(lowerQuery) ||
        comic.genres?.some(g => g.toLowerCase().includes(lowerQuery)) ||
        comic.altTitles?.some(t => t.toLowerCase().includes(lowerQuery))
    );

    return filtered.map(c => ({
      id: c.id,
      provider: "mangafire",
      title: c.title,
      altTitles: c.altTitles,
      cover: c.cover,
      type: c.type as any,
      status: c.status as any,
      latestChapter: `Chapter ${c.chaptersCount}`,
      url: c.url
    }));
  }

  async getDetails(id: string): Promise<ComicDetail> {
    if (this.baseUrl) {
      try {
        const response = await fetch(`${this.baseUrl}/api/manga/${id}`, {
          next: { revalidate: 3600 }
        });
        if (response.ok) {
          const json = await response.json();
          const info = json && json.success && json.data ? json.data : json;

          if (info && (info.mangaInfo || info.title)) {
            const mangaInfo = info.mangaInfo || info;
            const coverUrl = mangaInfo.poster || mangaInfo.cover || "";
            const finalCover = coverUrl.startsWith("/") ? `${this.baseUrl}${coverUrl}` : coverUrl;

            return {
              id: id,
              provider: "mangafire",
              title: mangaInfo.title || "",
              altTitles: mangaInfo.altTitles ? [mangaInfo.altTitles] : [],
              cover: finalCover,
              banner: mangaInfo.banner || finalCover,
              description: mangaInfo.description || "",
              type: mangaInfo.type ? mangaInfo.type.toLowerCase() as any : "manga",
              status: mangaInfo.status ? mangaInfo.status.toLowerCase() as any : "ongoing",
              author: Array.isArray(mangaInfo.author) ? mangaInfo.author : mangaInfo.author ? [mangaInfo.author] : ["Unknown"],
              artist: Array.isArray(mangaInfo.artist) ? mangaInfo.artist : mangaInfo.artist ? [mangaInfo.artist] : ["Unknown"],
              genres: mangaInfo.genres || [],
              rating: mangaInfo.rating ? parseFloat(mangaInfo.rating) : undefined,
              year: mangaInfo.published || mangaInfo.year || ""
            };
          }
        }
      } catch (error) {
        console.warn(`MangaFire API getDetails failed for ${id}, falling back to mock data:`, error);
      }
    }

    const mock = MOCK_COMICS.find(c => c.id === id);
    if (!mock) {
      throw new Error(`Comic not found: ${id}`);
    }
    return mock;
  }

  async getChapters(id: string, options?: { language?: string; page?: number }): Promise<Chapter[]> {
    const lang = options?.language || "en";
    if (this.baseUrl) {
      try {
        const response = await fetch(`${this.baseUrl}/api/manga/${id}/chapters/${lang}`, {
          next: { revalidate: 900 }
        });
        if (response.ok) {
          const json = await response.json();
          let rawChapters: any[] = [];
          
          if (json && json.success && Array.isArray(json.data)) {
            rawChapters = json.data;
          } else if (Array.isArray(json)) {
            rawChapters = json;
          }

          if (rawChapters.length > 0) {
            return rawChapters.map((item: any) => ({
              // Composite ID containing comicId~chapterId to allow seamless reading route resolution
              id: `${id}~${item.chapterId || item.id || ""}`,
              provider: "mangafire",
              comicId: id,
              title: item.title || `Chapter ${item.number || item.chapterNumber || ""}`,
              chapterNumber: item.number || item.chapterNumber || "",
              language: item.language || lang,
              createdAt: item.releaseDate || item.createdAt || "",
              url: item.url || ""
            }));
          }
        }
      } catch (error) {
        console.warn(`MangaFire API getChapters failed for ${id}, falling back to mock data:`, error);
      }
    }

    const mock = MOCK_COMICS.find(c => c.id === id);
    if (!mock) return [];

    const chaptersCount = mock.chaptersCount || 0;
    const chapters: Chapter[] = [];
    for (let i = chaptersCount; i >= 1; i--) {
      chapters.push({
        id: `${id}-chapter-${i}`,
        provider: "mangafire",
        comicId: id,
        title: `Chapter ${i}: The Journey Begins Part ${i}`,
        chapterNumber: `${i}`,
        language: lang,
        createdAt: new Date(Date.now() - (chaptersCount - i) * 24 * 3600 * 1000).toLocaleDateString(),
        url: ""
      });
    }
    return chapters;
  }

  async getPages(chapterId: string): Promise<ChapterPages> {
    const [comicId, realChapterId] = chapterId.includes("~")
      ? chapterId.split("~")
      : [null, chapterId];

    if (this.baseUrl && realChapterId) {
      try {
        const response = await fetch(`${this.baseUrl}/api/chapter/${realChapterId}`, {
          next: { revalidate: 1800 }
        });
        if (response.ok) {
          const json = await response.json();
          let pagesList: string[] = [];
          
          if (json && json.success && Array.isArray(json.data?.pages)) {
            pagesList = json.data.pages;
          } else if (Array.isArray(json)) {
            pagesList = json;
          }

          if (pagesList.length > 0) {
            // Proxied URLs to bypass CORS if they start with relative paths
            const finalPages = pagesList.map((url) => {
              if (url.startsWith("/")) {
                return `${this.baseUrl}${url}`;
              }
              // If it's a direct external image, route it via the scraper proxy endpoint to avoid CORS issues
              return `${this.baseUrl}/proxy-image?url=${encodeURIComponent(url)}`;
            });

            // Dynamically resolve next and previous chapters sequence
            let nextId: string | undefined = undefined;
            let prevId: string | undefined = undefined;

            if (comicId) {
              const chapters = await this.getChapters(comicId);
              const index = chapters.findIndex((ch) => ch.id === chapterId);
              if (index !== -1) {
                // List is sorted descending, so:
                // Next chapter is at index - 1
                // Previous chapter is at index + 1
                if (index > 0) {
                  nextId = chapters[index - 1].id;
                }
                if (index < chapters.length - 1) {
                  prevId = chapters[index + 1].id;
                }
              }
            }

            return {
              chapterId: chapterId,
              provider: "mangafire",
              pages: finalPages,
              nextChapterId: nextId,
              previousChapterId: prevId
            };
          }
        }
      } catch (error) {
        console.warn(`MangaFire API getPages failed for ${chapterId}, falling back to mock data:`, error);
      }
    }

    // Determine comicId and chapterNumber from mock ID
    const match = chapterId.match(/(.+)-chapter-(\d+)/);
    const mockComicId = match ? match[1] : "solo-leveling";
    const chapterNum = match ? parseInt(match[2], 10) : 1;

    const comic = MOCK_COMICS.find(c => c.id === mockComicId);
    const totalChapters = comic ? comic.chaptersCount || 1 : 179;

    const pages = getMockPages(mockComicId, chapterNum.toString());

    return {
      chapterId: chapterId,
      provider: "mangafire",
      pages: pages,
      nextChapterId: chapterNum < totalChapters ? `${mockComicId}-chapter-${chapterNum + 1}` : undefined,
      previousChapterId: chapterNum > 1 ? `${mockComicId}-chapter-${chapterNum - 1}` : undefined
    };
  }
}
export const mangafireProvider = new MangaFireProvider();
