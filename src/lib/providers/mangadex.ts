import { MangaProvider, ComicSearchResult, ComicDetail, Chapter, ChapterPages } from "./types";

export class MangaDexProvider implements MangaProvider {
  name = "mangadex";
  private apiBase = "https://api.mangadex.org";
  private cdnBase = "https://uploads.mangadex.org";

  async search(query: string, page = 1, format = ""): Promise<ComicSearchResult[]> {
    try {
      const limit = 20;
      const offset = (page - 1) * limit;
      const response = await fetch(
        `${this.apiBase}/manga?title=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&includes[]=cover_art&order[relevance]=desc&contentRating[]=safe&contentRating[]=suggestive`,
        { next: { revalidate: 300 } }
      );
      
      if (!response.ok) return [];
      const json = await response.json();
      
      if (!json.data || !Array.isArray(json.data)) return [];

      return json.data.map((item: any) => {
        const coverRel = item.relationships?.find((r: any) => r.type === "cover_art");
        const fileName = coverRel?.attributes?.fileName;
        const coverUrl = fileName 
          ? `${this.cdnBase}/covers/${item.id}/${fileName}.256.jpg` 
          : "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=256&auto=format&fit=crop&q=80";

        const title = item.attributes?.title?.en || Object.values(item.attributes?.title || {})[0] || "Unknown Title";
        const altTitlesObj = item.attributes?.altTitles || [];
        const altTitles = altTitlesObj.map((alt: any) => Object.values(alt)[0] as string);
        const originalLanguage = item.attributes?.originalLanguage;

        let type: any = "manga";
        if (originalLanguage === "ko") type = "manhwa";
        if (originalLanguage === "zh") type = "manhua";

        return {
          id: item.id,
          provider: "mangadex",
          title: title as string,
          altTitles: altTitles,
          cover: coverUrl,
          type: type,
          status: item.attributes?.status || "ongoing",
          latestChapter: undefined
        };
      });
    } catch (error) {
      console.error("MangaDex search failed:", error);
      return [];
    }
  }

  async getDetails(id: string): Promise<ComicDetail> {
    try {
      const response = await fetch(
        `${this.apiBase}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) throw new Error("Failed to load MangaDex details");
      const json = await response.json();
      const item = json.data;
      if (!item) throw new Error("MangaDex details data is null");

      const title = item.attributes?.title?.en || Object.values(item.attributes?.title || {})[0] || "Unknown Title";
      const description = item.attributes?.description?.en || Object.values(item.attributes?.description || {})[0] || "";
      
      const coverRel = item.relationships?.find((r: any) => r.type === "cover_art");
      const fileName = coverRel?.attributes?.fileName;
      const coverUrl = fileName 
        ? `${this.cdnBase}/covers/${item.id}/${fileName}` 
        : "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80";

      const authors = item.relationships
        ?.filter((r: any) => r.type === "author" && r.attributes?.name)
        .map((r: any) => r.attributes.name) || [];
      const artists = item.relationships
        ?.filter((r: any) => r.type === "artist" && r.attributes?.name)
        .map((r: any) => r.attributes.name) || [];

      const genres = item.attributes?.tags
        ?.filter((t: any) => t.attributes?.group === "genre")
        .map((t: any) => t.attributes?.name?.en) || [];

      const originalLanguage = item.attributes?.originalLanguage;
      let type = "Manga";
      if (originalLanguage === "ko") type = "Manhwa";
      if (originalLanguage === "zh") type = "Manhua";

      return {
        id: item.id,
        provider: "mangadex",
        title: title as string,
        altTitles: (item.attributes?.altTitles || []).map((alt: any) => Object.values(alt)[0] as string),
        cover: coverUrl,
        banner: coverUrl, // Fallback cover as banner background
        description: description,
        type: type,
        status: item.attributes?.status || "ongoing",
        author: authors.length > 0 ? authors : ["Unknown"],
        artist: artists.length > 0 ? artists : ["Unknown"],
        genres: genres,
        year: item.attributes?.year ? String(item.attributes.year) : "",
        rating: 9.0 // Standard placeholder rating for MD
      };
    } catch (error) {
      console.error(`MangaDex getDetails failed for ${id}:`, error);
      throw error;
    }
  }

  async getChapters(id: string, options?: { language?: string }): Promise<Chapter[]> {
    try {
      const lang = options?.language || "en";
      const response = await fetch(
        `${this.apiBase}/manga/${id}/feed?limit=500&translatedLanguage[]=${lang}&order[chapter]=desc`,
        { next: { revalidate: 900 } }
      );

      if (!response.ok) return [];
      const json = await response.json();
      if (!json.data || !Array.isArray(json.data)) return [];

      return json.data.map((item: any) => {
        const chapterNum = item.attributes?.chapter || "";
        const title = item.attributes?.title 
          ? `Chapter ${chapterNum}: ${item.attributes.title}`
          : `Chapter ${chapterNum || "Oneshot"}`;

        return {
          id: `${id}~${item.id}`,
          provider: "mangadex",
          comicId: id,
          title: title,
          chapterNumber: chapterNum,
          language: lang,
          createdAt: item.attributes?.createdAt 
            ? new Date(item.attributes.createdAt).toLocaleDateString()
            : ""
        };
      });
    } catch (error) {
      console.error(`MangaDex getChapters failed for ${id}:`, error);
      return [];
    }
  }

  async getPages(chapterId: string): Promise<ChapterPages> {
    const [comicId, realChapterId] = chapterId.includes("~")
      ? chapterId.split("~")
      : [null, chapterId];

    try {
      const response = await fetch(`${this.apiBase}/at-home/server/${realChapterId}`, {
        next: { revalidate: 1800 }
      });

      if (!response.ok) throw new Error("Failed to load MangaDex pages");
      const json = await response.json();
      
      const hash = json.chapter?.hash;
      const files = json.chapter?.data;
      const baseUrl = json.baseUrl;

      if (!hash || !files || !baseUrl) throw new Error("MangaDex page details missing from payload");

      const pages = files.map((file: string) => `${baseUrl}/data/${hash}/${file}`);

      // Dynamically resolve next and previous chapters sequence
      let nextId: string | undefined = undefined;
      let prevId: string | undefined = undefined;

      if (comicId) {
        const chapters = await this.getChapters(comicId);
        const index = chapters.findIndex((ch) => ch.id === chapterId);
        if (index !== -1) {
          // Descending list:
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
        provider: "mangadex",
        pages: pages,
        nextChapterId: nextId,
        previousChapterId: prevId
      };
    } catch (error) {
      console.error(`MangaDex getPages failed for ${chapterId}:`, error);
      throw error;
    }
  }
}

export const mangadexProvider = new MangaDexProvider();
