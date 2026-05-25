export type ComicSearchResult = {
  id: string;
  provider: string;
  title: string;
  altTitles?: string[];
  cover?: string;
  type?: "manga" | "manhwa" | "manhua" | "comic" | "unknown";
  status?: "ongoing" | "completed" | "hiatus" | "unknown";
  latestChapter?: string;
  url?: string;
};

export type ComicDetail = {
  id: string;
  provider: string;
  title: string;
  altTitles?: string[];
  cover?: string;
  banner?: string;
  description?: string;
  type?: string;
  status?: string;
  author?: string[];
  artist?: string[];
  genres?: string[];
  year?: string;
  rating?: number;
  chaptersCount?: number;
  url?: string;
};

export type Chapter = {
  id: string;
  provider: string;
  comicId: string;
  title?: string;
  chapterNumber?: string;
  language?: string;
  createdAt?: string;
  url?: string;
};

export type ChapterPages = {
  chapterId: string;
  provider: string;
  pages: string[];
  nextChapterId?: string;
  previousChapterId?: string;
};

export interface MangaProvider {
  name: string;
  search(query: string, page?: number, format?: string): Promise<ComicSearchResult[]>;
  getDetails(id: string): Promise<ComicDetail>;
  getChapters(id: string, options?: { language?: string; page?: number }): Promise<Chapter[]>;
  getPages(chapterId: string): Promise<ChapterPages>;
}
