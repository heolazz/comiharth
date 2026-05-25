import { MangaProvider, ComicSearchResult, ComicDetail, Chapter, ChapterPages } from "./types";

export class ShinigamiProvider implements MangaProvider {
  name = "shinigami";
  private apiBase = "https://api.shngm.io/v1";

  async search(query: string, page = 1, format = "", genre = "", status = "", sort = ""): Promise<{ results: ComicSearchResult[], totalCount?: number }> {
    try {
      const limit = 24;
      const url = new URL(`${this.apiBase}/manga/list`);
      url.searchParams.set("page", String(page));
      url.searchParams.set("page_size", String(limit));
      if (sort === "title-asc") {
        url.searchParams.set("sort", "title");
        url.searchParams.set("sort_order", "asc");
      } else if (sort === "title-desc") {
        url.searchParams.set("sort", "title");
        url.searchParams.set("sort_order", "desc");
      } else {
        url.searchParams.set("sort", "latest");
        url.searchParams.set("sort_order", "desc");
      }
      
      // Pass format query filter to Shinigami API if defined (manga, manhwa, manhua)
      if (format && format !== "all") {
        url.searchParams.set("format", format.trim().toLowerCase());
      }

      // Pass genre filter if defined
      if (genre && genre !== "all") {
        url.searchParams.set("genre", genre.trim().toLowerCase());
      }

      // Pass status filter if defined (Shinigami supports string or numeric IDs; strings like 'ongoing' usually map correctly)
      if (status && status !== "all") {
        url.searchParams.set("status", status.trim().toLowerCase());
      }

      // If query is valid, perform full text filtering using the API's q search query param
      if (query && query.trim() && query.trim() !== "a") {
        url.searchParams.set("q", query.trim());
      }

      const res = await fetch(url.toString(), { next: { revalidate: 300 } });
      if (!res.ok) return { results: [] };
      
      const json = await res.json();
      if (!json.data || !Array.isArray(json.data)) return { results: [] };

      const totalCount = json.meta?.total_record;

      const results = json.data.map((item: any) => {
        const cover = item.cover_portrait_url || item.cover_image_url || "";
        
        let type: any = "manga";
        const formatStr = item.taxonomy?.Format?.[0]?.slug || "";
        if (formatStr.includes("manhwa")) type = "manhwa";
        else if (formatStr.includes("manhua")) type = "manhua";
        else if (item.country_id === 'KR') type = "manhwa";
        else if (item.country_id === 'CN') type = "manhua";
        else if (item.country_id === 'JP') type = "manga";

        return {
          id: item.manga_id,
          provider: "shinigami",
          title: item.title,
          altTitles: item.alternative_title ? [item.alternative_title] : [],
          cover: cover,
          type: type,
          status: item.status === 1 ? "ongoing" : item.status === 2 ? "completed" : "unknown",
          latestChapter: item.latest_chapter_number ? `Ch. ${item.latest_chapter_number}` : undefined
        };
      });

      return { results, totalCount };
    } catch (error) {
      console.error("Shinigami search failed:", error);
      return { results: [] };
    }
  }

  async getDetails(id: string): Promise<ComicDetail> {
    try {
      const res = await fetch(`${this.apiBase}/manga/detail/${id}`, {
        next: { revalidate: 600 }
      });
      if (!res.ok) throw new Error(`Failed to load Shinigami details: ${res.status}`);
      
      const json = await res.json();
      const item = json.data;
      if (!item) throw new Error("Shinigami details data is null");

      const cover = item.cover_portrait_url || item.cover_image_url || "";
      const banner = item.cover_image_url || cover;

      const authors = item.taxonomy?.Author?.map((a: any) => a.name) || [];
      const artists = item.taxonomy?.Artist?.map((a: any) => a.name) || [];
      const genres = item.taxonomy?.Genre?.map((g: any) => g.name) || [];

      let type = "Manga";
      const formatStr = item.taxonomy?.Format?.[0]?.name || "";
      if (formatStr.toLowerCase().includes("manhwa")) type = "Manhwa";
      if (formatStr.toLowerCase().includes("manhua")) type = "Manhua";

      return {
        id: item.manga_id,
        provider: "shinigami",
        title: item.title,
        altTitles: item.alternative_title ? [item.alternative_title] : [],
        cover: cover,
        banner: banner,
        description: item.description || "",
        type: type,
        status: item.status === 1 ? "ongoing" : item.status === 2 ? "completed" : "unknown",
        author: authors.length > 0 ? authors : ["Unknown"],
        artist: artists.length > 0 ? artists : ["Unknown"],
        genres: genres,
        year: item.release_year ? String(item.release_year) : "",
        rating: item.user_rate || 8.5
      };
    } catch (error) {
      console.error(`Shinigami getDetails failed for ${id}:`, error);
      throw error;
    }
  }

  async getChapters(id: string, options?: { page?: number }): Promise<Chapter[]> {
    try {
      const page = options?.page || 1;
      const res = await fetch(
        `${this.apiBase}/chapter/${id}/list?page=${page}&page_size=500&sort_by=chapter_number&sort_order=desc`,
        { next: { revalidate: 300 } }
      );
      if (!res.ok) return [];

      const json = await res.json();
      if (!json.data || !Array.isArray(json.data)) return [];

      return json.data.map((item: any) => {
        return {
          id: `${id}~${item.chapter_id}`,
          provider: "shinigami",
          comicId: id,
          title: item.chapter_title ? `Chapter ${item.chapter_number}: ${item.chapter_title}` : `Chapter ${item.chapter_number}`,
          chapterNumber: String(item.chapter_number),
          createdAt: item.release_date 
            ? new Date(item.release_date).toLocaleDateString()
            : ""
        };
      });
    } catch (error) {
      console.error(`Shinigami getChapters failed for ${id}:`, error);
      return [];
    }
  }

  async getPages(chapterId: string): Promise<ChapterPages> {
    const [comicId, realChapterId] = chapterId.includes("~")
      ? chapterId.split("~")
      : [null, chapterId];

    try {
      const res = await fetch(`${this.apiBase}/chapter/detail/${realChapterId}`, {
        next: { revalidate: 1800 }
      });
      if (!res.ok) throw new Error(`Failed to load Shinigami pages: ${res.status}`);

      const json = await res.json();
      const data = json.data;
      if (!data) throw new Error("Shinigami page response data is null");

      const baseUrl = data.base_url || "https://assets.shngm.id";
      const path = data.chapter?.path || "";
      const files = data.chapter?.data || [];

      // Combine base_url + path + fileName
      const pages = files.map((file: string) => `${baseUrl}${path}${file}`);

      // Map next/prev chapter IDs dynamically from response, keeping comicId for routing
      let nextChapterId: string | undefined = undefined;
      let previousChapterId: string | undefined = undefined;

      if (comicId) {
        if (data.next_chapter_id) {
          nextChapterId = `${comicId}~${data.next_chapter_id}`;
        }
        if (data.prev_chapter_id) {
          previousChapterId = `${comicId}~${data.prev_chapter_id}`;
        }
      }

      return {
        chapterId: chapterId,
        provider: "shinigami",
        pages: pages,
        nextChapterId,
        previousChapterId
      };
    } catch (error) {
      console.error(`Shinigami getPages failed for ${chapterId}:`, error);
      throw error;
    }
  }
}

export const shinigamiProvider = new ShinigamiProvider();
