# PanelHarth / Shinigami Manga Reader Planning

## 1. Project Overview

Project ini adalah web baca komik untuk manga, manhwa, dan manhua dengan sumber data utama dari Shinigami API.

Tujuan utama MVP:

- Menampilkan daftar manga/manhwa/manhua terbaru.
- Menampilkan detail manga.
- Menampilkan daftar chapter.
- Membuat reader vertical-scroll seperti Webtoon.
- Menyediakan search internal berdasarkan data yang disimpan.
- Menyimpan progress baca, bookmark, dan history user.
- Membuat struktur provider agar nanti bisa ditambah source lain.

Nama app yang disarankan: **PanelHarth**.

Alternatif nama:

```txt
HarthPanel
MangaHarth
ReHarth Panels
```

---

## 2. Core Data Source

Base API:

```txt
https://api.shngm.io/v1
```

Base web reader:

```txt
https://g.shinigami.asia
```

Asset CDN:

```txt
https://assets.shngm.id
```

---

## 3. Endpoint yang Sudah Ditemukan

### 3.1 Manga List / Catalog

Endpoint utama untuk mengambil katalog manga/manhwa/manhua.

```txt
GET https://api.shngm.io/v1/manga/list?page=1&page_size=24&genre_include_mode=or&genre_exclude_mode=or&sort=latest&sort_order=desc
```

Kegunaan:

- Home latest update.
- Explore page.
- Sync katalog ke database.
- Browse all manga/manhwa/manhua.

Response penting:

```ts
type MangaListItem = {
  manga_id: string;
  title: string;
  alternative_title: string;
  description: string;
  cover_image_url: string;
  cover_portrait_url: string;
  latest_chapter_id: string;
  latest_chapter_number: number;
  latest_chapter_time: string;
  country_id: string;
  release_year: string;
  status: number;
  user_rate: number;
  view_count: number;
  bookmark_count: number;
  is_recommended: boolean;
  taxonomy: {
    Artist?: TaxonomyItem[];
    Author?: TaxonomyItem[];
    Format?: TaxonomyItem[];
    Genre?: TaxonomyItem[];
    Type?: TaxonomyItem[];
  };
  created_at: string;
  updated_at: string;
};
```

Parameter yang sudah terbukti bisa dipakai:

```txt
page
page_size
category
format
is_recommended
sort
sort_order
genre_include_mode
genre_exclude_mode
```

Contoh variasi:

```txt
GET /v1/manga/list?page=1&page_size=24&sort=latest&sort_order=desc
GET /v1/manga/list?format=manhwa&page=1&page_size=24&sort=latest&sort_order=desc
GET /v1/manga/list?format=manhua&page=1&page_size=24&sort=latest&sort_order=desc
GET /v1/manga/list?format=manga&page=1&page_size=24&sort=latest&sort_order=desc
GET /v1/manga/list?format=manhwa&page=1&page_size=10&is_recommended=true&sort=latest&sort_order=desc
GET /v1/manga/list?page=1&page_size=9&category=explore-list-1
```

---

### 3.2 Manga Detail

Endpoint untuk mengambil detail satu manga berdasarkan `manga_id`.

```txt
GET https://api.shngm.io/v1/manga/detail/{manga_id}
```

Contoh:

```txt
GET https://api.shngm.io/v1/manga/detail/0230fc25-5bff-4827-a210-931d870721ac
```

Kegunaan:

- Halaman detail manga.
- Metadata resmi dari source.
- Data cover, description, taxonomy, rating, latest chapter.

Response penting:

```ts
type MangaDetail = {
  id: number;
  manga_id: string;
  title: string;
  description: string;
  alternative_title: string;
  release_year: string;
  status: number;
  cover_image_url: string;
  cover_portrait_url: string;
  view_count: number;
  user_rate: number;
  latest_chapter_id: string;
  latest_chapter_number: number;
  latest_chapter_time: string;
  country_id: string;
  bookmark_count: number;
  rank: number;
  is_recommended: boolean;
  taxonomy: {
    Artist?: TaxonomyItem[];
    Author?: TaxonomyItem[];
    Format?: TaxonomyItem[];
    Genre?: TaxonomyItem[];
    Type?: TaxonomyItem[];
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
```

---

### 3.3 Chapter List

Endpoint untuk mengambil daftar chapter berdasarkan `manga_id`.

```txt
GET https://api.shngm.io/v1/chapter/{manga_id}/list?page=1&page_size=24&sort_by=chapter_number&sort_order=desc
```

Contoh:

```txt
GET https://api.shngm.io/v1/chapter/9ca53068-027e-499c-8ec7-fc0c8a95c252/list?page=1&page_size=24&sort_by=chapter_number&sort_order=desc
```

Kegunaan:

- Menampilkan daftar chapter di halaman detail.
- Pagination chapter.
- Membuat tombol Start Reading dan Latest Chapter.
- Mengambil `chapter_id` untuk reader.

Response penting:

```ts
type ChapterListItem = {
  chapter_id: string;
  manga_id: string;
  chapter_title: string;
  chapter_number: number;
  thumbnail_image_url: string;
  view_count: number;
  release_date: string;
};
```

Sort:

```txt
sort_by=chapter_number
sort_order=desc
sort_order=asc
```

---

### 3.4 Genre List

Endpoint untuk mengambil daftar genre.

```txt
GET https://api.shngm.io/v1/genre/list
```

Kegunaan:

- Filter genre di explore page.
- Genre chips.
- Halaman `/genre/[slug]`.
- Search filtering.

Response umum:

```ts
type TaxonomyItem = {
  taxonomy_id?: number;
  slug: string;
  name: string;
  type?: string;
};
```

---

### 3.5 Format List

Endpoint untuk mengambil daftar format.

```txt
GET https://api.shngm.io/v1/format/list?page=1
```

Kegunaan:

- Filter format.
- Tab Manga / Manhwa / Manhua.
- Explore filter.

Format yang kemungkinan digunakan:

```txt
manga
manhwa
manhua
```

---

### 3.6 Reader Page

Reader page dari web source:

```txt
GET https://g.shinigami.asia/chapter/{chapter_id}
```

Contoh:

```txt
GET https://g.shinigami.asia/chapter/3b282225-442d-40b2-b5f4-41f9a352809e
```

Dari halaman ini, ambil image page dari HTML:

```html
<img src="https://assets.shngm.id/chapter/manga_{manga_id}/chapter_{chapter_id}/01-f5a70b.jpg" />
```

Pola CDN:

```txt
https://assets.shngm.id/chapter/manga_{manga_id}/chapter_{chapter_id}/{pageFile}.jpg
```

Catatan:

- Untuk reader, belum perlu endpoint `/pages`.
- Cukup fetch halaman chapter lalu parse semua `<img src>` yang mengandung `assets.shngm.id/chapter`.
- Render hasilnya sebagai vertical webtoon reader.

---

## 4. App Architecture

Recommended stack:

```txt
Next.js 16 / 15
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion
Supabase / PostgreSQL
Prisma ORM
Auth.js / Supabase Auth
Cheerio
```

Optional:

```txt
TanStack Query
Zustand
Next Themes
React Virtual
```

---

## 5. Route Structure

### Frontend Routes

```txt
/
  Home page

/explore
  Browse all manga/manhwa/manhua

/search
  Search result page

/manga/[mangaId]
  Manga detail + chapter list

/read/[chapterId]
  Vertical reader

/library
  User bookmarks/favorites

/history
  Reading history

/settings
  Reader/user settings
```

### Internal API Routes

```txt
/api/shinigami/manga
/api/shinigami/manga/[mangaId]
/api/shinigami/manga/[mangaId]/chapters
/api/shinigami/chapter/[chapterId]/pages
/api/shinigami/genres
/api/shinigami/formats
/api/search
/api/admin/sync/shinigami
```

---

## 6. Data Flow

### 6.1 Home Page

```txt
Client opens home
↓
Fetch latest manga list
↓
Fetch recommended manhwa
↓
Render hero + latest update + recommended sections
```

Data source:

```txt
GET /v1/manga/list?page=1&page_size=24&sort=latest&sort_order=desc
GET /v1/manga/list?format=manhwa&page=1&page_size=10&is_recommended=true&sort=latest&sort_order=desc
```

---

### 6.2 Explore Page

```txt
User opens explore
↓
Fetch manga list with page, format, genre, sort
↓
Render grid cards
↓
User can filter by format/genre/status
```

Data source:

```txt
GET /v1/manga/list?page=1&page_size=24&genre_include_mode=or&genre_exclude_mode=or&sort=latest&sort_order=desc
GET /v1/genre/list
GET /v1/format/list?page=1
```

---

### 6.3 Manga Detail Page

```txt
User opens /manga/[mangaId]
↓
Fetch manga detail
↓
Fetch chapter list
↓
Render cover, metadata, synopsis, genre, chapter list
```

Data source:

```txt
GET /v1/manga/detail/{manga_id}
GET /v1/chapter/{manga_id}/list?page=1&page_size=24&sort_by=chapter_number&sort_order=desc
```

---

### 6.4 Reader Page

```txt
User opens /read/[chapterId]
↓
Internal API fetches https://g.shinigami.asia/chapter/{chapterId}
↓
Parse HTML using Cheerio
↓
Extract all image URLs
↓
Sort pages by number
↓
Return pages[]
↓
Frontend renders vertical reader
```

---

## 7. Provider Layer

Create a provider abstraction so the app can support more sources later.

Folder:

```txt
src/
  providers/
    types.ts
    shinigami/
      constants.ts
      shinigami.provider.ts
      shinigami.mapper.ts
      shinigami.pages.ts
```

### Provider Interface

```ts
export interface ComicProvider {
  id: string;
  name: string;

  getMangaList(params: MangaListParams): Promise<PaginatedResult<Comic>>;
  getMangaDetail(mangaId: string): Promise<ComicDetail>;
  getChapterList(params: ChapterListParams): Promise<PaginatedResult<Chapter>>;
  getChapterPages(chapterId: string): Promise<ChapterPagesResult>;
  getGenres(): Promise<TaxonomyItem[]>;
  getFormats(): Promise<TaxonomyItem[]>;
}
```

### Types

```ts
export type TaxonomyItem = {
  id?: number;
  slug: string;
  name: string;
  type?: string;
};

export type Comic = {
  id: string;
  provider: "shinigami";
  title: string;
  alternativeTitle?: string;
  description?: string;
  cover?: string;
  banner?: string;
  releaseYear?: string;
  status?: number;
  country?: string;
  rating?: number;
  views?: number;
  bookmarks?: number;
  latestChapterId?: string;
  latestChapterNumber?: number;
  latestChapterTime?: string;
  genres: TaxonomyItem[];
  format?: TaxonomyItem;
  type?: TaxonomyItem;
  author: TaxonomyItem[];
  artist: TaxonomyItem[];
};

export type Chapter = {
  id: string;
  provider: "shinigami";
  mangaId: string;
  title: string;
  chapterNumber: number;
  thumbnail?: string;
  views?: number;
  releaseDate?: string;
  readerUrl: string;
};

export type ChapterPagesResult = {
  provider: "shinigami";
  chapterId: string;
  pages: string[];
  totalPages: number;
};
```

---

## 8. Shinigami Provider Implementation

### 8.1 Constants

```ts
export const SHINIGAMI_API = "https://api.shngm.io/v1";
export const SHINIGAMI_WEB = "https://g.shinigami.asia";
```

### 8.2 Manga List Function

```ts
export async function getShinigamiMangaList({
  page = 1,
  pageSize = 24,
  format,
  isRecommended,
  sort = "latest",
  sortOrder = "desc",
}: {
  page?: number;
  pageSize?: number;
  format?: "manga" | "manhwa" | "manhua";
  isRecommended?: boolean;
  sort?: string;
  sortOrder?: "asc" | "desc";
}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    genre_include_mode: "or",
    genre_exclude_mode: "or",
    sort,
    sort_order: sortOrder,
  });

  if (format) params.set("format", format);
  if (typeof isRecommended === "boolean") {
    params.set("is_recommended", String(isRecommended));
  }

  const res = await fetch(`${SHINIGAMI_API}/manga/list?${params.toString()}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch manga list: ${res.status}`);
  }

  const json = await res.json();

  return {
    meta: json.meta,
    data: json.data.map(mapShinigamiManga),
  };
}
```

### 8.3 Manga Detail Function

```ts
export async function getShinigamiMangaDetail(mangaId: string) {
  const res = await fetch(`${SHINIGAMI_API}/manga/detail/${mangaId}`, {
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch manga detail: ${res.status}`);
  }

  const json = await res.json();

  return mapShinigamiManga(json.data);
}
```

### 8.4 Chapter List Function

```ts
export async function getShinigamiChapterList({
  mangaId,
  page = 1,
  pageSize = 24,
  sortOrder = "desc",
}: {
  mangaId: string;
  page?: number;
  pageSize?: number;
  sortOrder?: "asc" | "desc";
}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: "chapter_number",
    sort_order: sortOrder,
  });

  const res = await fetch(
    `${SHINIGAMI_API}/chapter/${mangaId}/list?${params.toString()}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch chapter list: ${res.status}`);
  }

  const json = await res.json();

  return {
    meta: json.meta,
    data: json.data.map(mapShinigamiChapter),
  };
}
```

### 8.5 Chapter Pages Function

```ts
import * as cheerio from "cheerio";

export async function getShinigamiChapterPages(chapterId: string) {
  const chapterUrl = `${SHINIGAMI_WEB}/chapter/${chapterId}`;

  const res = await fetch(chapterUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch chapter HTML: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const pages = new Set<string>();

  $("img").each((_, el) => {
    const src = $(el).attr("src");
    if (!src) return;

    if (
      src.includes("assets.shngm.id/chapter") &&
      /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(src)
    ) {
      pages.add(src);
    }
  });

  const sortedPages = Array.from(pages).sort((a, b) => {
    const getPageNumber = (url: string) => {
      const filename = url.split("/").pop() || "";
      const match = filename.match(/^(\d+)/);
      return match ? Number(match[1]) : 9999;
    };

    return getPageNumber(a) - getPageNumber(b);
  });

  return {
    provider: "shinigami" as const,
    chapterId,
    totalPages: sortedPages.length,
    pages: sortedPages,
  };
}
```

### 8.6 Mapper

```ts
import { SHINIGAMI_WEB } from "./constants";

export function mapShinigamiManga(item: any) {
  return {
    id: item.manga_id,
    provider: "shinigami" as const,
    title: item.title,
    alternativeTitle: item.alternative_title,
    description: item.description,
    cover: item.cover_portrait_url || item.cover_image_url,
    banner: item.cover_image_url,
    releaseYear: item.release_year,
    status: item.status,
    country: item.country_id,
    rating: item.user_rate,
    views: item.view_count,
    bookmarks: item.bookmark_count,
    latestChapterId: item.latest_chapter_id,
    latestChapterNumber: item.latest_chapter_number,
    latestChapterTime: item.latest_chapter_time,
    genres: item.taxonomy?.Genre ?? [],
    format: item.taxonomy?.Format?.[0],
    type: item.taxonomy?.Type?.[0],
    author: item.taxonomy?.Author ?? [],
    artist: item.taxonomy?.Artist ?? [],
    seriesUrl: `${SHINIGAMI_WEB}/series/${item.manga_id}`,
    latestChapterUrl: item.latest_chapter_id
      ? `${SHINIGAMI_WEB}/chapter/${item.latest_chapter_id}`
      : null,
    raw: item,
  };
}

export function mapShinigamiChapter(item: any) {
  return {
    id: item.chapter_id,
    provider: "shinigami" as const,
    mangaId: item.manga_id,
    title: item.chapter_title || `Chapter ${item.chapter_number}`,
    chapterNumber: item.chapter_number,
    thumbnail: item.thumbnail_image_url,
    views: item.view_count,
    releaseDate: item.release_date,
    readerUrl: `${SHINIGAMI_WEB}/chapter/${item.chapter_id}`,
    raw: item,
  };
}
```

---

## 9. Search Strategy

Search endpoint asli tidak wajib untuk MVP.

Recommended approach:

```txt
Sync manga catalog
↓
Save into own database
↓
Search from own database
```

Benefits:

- Faster.
- Bisa custom ranking.
- Tidak bergantung ke endpoint search source.
- Bisa search across title, alternative title, description, genre, author, artist.
- Bisa gabung multi-provider nanti.

### Simple Search Fields

```txt
title
alternative_title
description
author name
artist name
genre name
format
country
release_year
```

### Supabase Search Example

```ts
const { data, error } = await supabase
  .from("comics")
  .select("*")
  .or(
    `title.ilike.%${query}%,alternative_title.ilike.%${query}%,description.ilike.%${query}%`
  )
  .limit(30);
```

### Prisma Search Example

```ts
const comics = await prisma.comic.findMany({
  where: {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { alternativeTitle: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ],
  },
  take: 30,
});
```

Optional upgrade:

```txt
PostgreSQL Full Text Search
Meilisearch
Typesense
Fuse.js for local small dataset
```

---

## 10. Database Design

### 10.1 Prisma Schema

```prisma
model Comic {
  id                  String   @id @default(cuid())
  provider            String
  sourceId            String
  title               String
  alternativeTitle    String?
  description         String?
  cover               String?
  banner              String?
  releaseYear         String?
  status              Int?
  country             String?
  rating              Float?
  views               Int?
  bookmarks           Int?
  latestChapterId     String?
  latestChapterNumber Float?
  latestChapterTime   DateTime?
  genres              Json?
  format              Json?
  type                Json?
  author              Json?
  artist              Json?
  raw                 Json?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  chapters            Chapter[]

  @@unique([provider, sourceId])
  @@index([title])
  @@index([provider])
}

model Chapter {
  id             String   @id @default(cuid())
  provider       String
  sourceId       String
  comicId        String
  sourceMangaId  String
  title          String
  chapterNumber  Float?
  thumbnail      String?
  views          Int?
  releaseDate    DateTime?
  readerUrl      String?
  raw            Json?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  comic          Comic    @relation(fields: [comicId], references: [id], onDelete: Cascade)
  pages          ChapterPage[]

  @@unique([provider, sourceId])
  @@index([comicId])
  @@index([sourceMangaId])
  @@index([chapterNumber])
}

model ChapterPage {
  id         String   @id @default(cuid())
  chapterId  String
  index      Int
  imageUrl   String
  createdAt  DateTime @default(now())

  chapter    Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)

  @@unique([chapterId, index])
}

model UserLibrary {
  id        String   @id @default(cuid())
  userId    String
  comicId   String
  createdAt DateTime @default(now())

  @@unique([userId, comicId])
}

model ReadingHistory {
  id            String   @id @default(cuid())
  userId        String
  comicId       String
  chapterId     String
  pageIndex     Int      @default(0)
  progress      Float    @default(0)
  lastReadAt    DateTime @default(now())

  @@unique([userId, chapterId])
  @@index([userId])
  @@index([comicId])
}
```

---

## 11. Sync Strategy

### 11.1 What to Sync

Sync to database:

```txt
Manga catalog
Manga detail
Chapter list
Genre list
Format list
```

Do not sync all chapter pages at once.

Chapter pages should be fetched on demand:

```txt
User opens reader
↓
Check database for pages
↓
If not cached, scrape HTML
↓
Save pages
↓
Return pages to reader
```

### 11.2 Catalog Sync

```ts
export async function syncShinigamiCatalog() {
  let page = 1;
  let totalPage = 1;

  do {
    const result = await getShinigamiMangaList({
      page,
      pageSize: 24,
      sort: "latest",
      sortOrder: "desc",
    });

    totalPage = result.meta.total_page;

    for (const comic of result.data) {
      await upsertComic(comic);
    }

    page++;
    await sleep(800);
  } while (page <= totalPage);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### 11.3 Chapter Sync Per Manga

```ts
export async function syncShinigamiChapters(mangaId: string) {
  let page = 1;
  let totalPage = 1;

  do {
    const result = await getShinigamiChapterList({
      mangaId,
      page,
      pageSize: 24,
      sortOrder: "desc",
    });

    totalPage = result.meta.total_page;

    for (const chapter of result.data) {
      await upsertChapter(chapter);
    }

    page++;
    await sleep(500);
  } while (page <= totalPage);
}
```

### 11.4 Recommended Cron Schedule

```txt
Every 6 hours:
- sync latest page 1-3

Every day:
- sync full catalog

On manga detail page:
- refresh chapter list for that manga

On reader page:
- scrape pages on demand
```

---

## 12. Reader Design

Reader mode:

```txt
Vertical scroll
Black background
No image gap
Max width 720px - 900px
Lazy loading
Progress indicator
Next/previous chapter navigation
Back to detail button
Reader settings
```

### Reader Component

```tsx
type WebtoonReaderProps = {
  pages: string[];
};

export function WebtoonReader({ pages }: WebtoonReaderProps) {
  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto flex max-w-[820px] flex-col items-center gap-0">
        {pages.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`Page ${index + 1}`}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full object-contain"
          />
        ))}
      </div>
    </main>
  );
}
```

### Reader UX Features

MVP:

```txt
Sticky top bar
Chapter title
Back button
Next chapter
Previous chapter
Page loading skeleton
Error state
Reload pages button
```

Later:

```txt
Reading progress
Auto-save last page
Reader width setting
Brightness setting
Image preloading
Keyboard shortcuts
Full screen mode
```

---

## 13. UI Pages

### 13.1 Home Page Sections

```txt
Hero carousel
Latest Update
Recommended Manhwa
Popular / Most Viewed
Manga / Manhwa / Manhua tabs
Continue Reading
```

### 13.2 Explore Page

Filters:

```txt
Format: Manga / Manhwa / Manhua
Genre
Sort: latest / popular / rating
Status
Type: Project / Mirror
Country: KR / CN / JP
```

Grid card data:

```txt
Cover
Title
Latest chapter
Rating
Views
Format badge
Genre badges
```

### 13.3 Detail Page

Sections:

```txt
Cover / banner
Title
Alternative title
Description
Genre chips
Author / artist
Format
Type
Release year
Rating
Views
Bookmark count
Start reading
Latest chapter
Chapter list
```

### 13.4 Reader Page

Sections:

```txt
Top reader nav
Image reader
Bottom chapter nav
Floating progress
```

---

## 14. Caching and Performance

### Recommended Caching

```txt
Manga list: revalidate 5 minutes
Manga detail: revalidate 10 minutes
Chapter list: revalidate 5 minutes
Genre/format list: revalidate 1 day
Chapter pages: cache in database after first scrape
```

### Performance Notes

- Use `loading="lazy"` for images.
- Avoid Next Image for remote reader pages unless domain config is ready.
- Use plain `<img>` for reader images for better compatibility.
- Do not download/reupload chapter images.
- Store only image URLs.
- Use pagination on explore and chapter list.
- Add rate limit to internal scraping endpoint.
- Add timeout for fetch requests.

---

## 15. Error Handling

Handle:

```txt
API returns non-200
retcode not 0
empty manga list
empty chapter list
chapter page cannot be fetched
no image page found
image hotlink blocked
timeout
invalid mangaId/chapterId
```

Reader fallback:

```txt
Show error state
Button: Retry
Button: Open source chapter
```

Example:

```ts
if (!pages.length) {
  return {
    error: "No pages found",
    sourceUrl: `${SHINIGAMI_WEB}/chapter/${chapterId}`,
  };
}
```

---

## 16. Security and Safety

Important:

- Do not expose unlimited scraping endpoint.
- Validate URLs and IDs.
- Only allow chapter IDs matching UUID format.
- Only fetch from allowed hosts:
  - `g.shinigami.asia`
  - `api.shngm.io`
- Rate limit scraping endpoint.
- Do not bypass login, paywall, DRM, or private token.
- Do not reupload images to your own storage.
- Use this source carefully for learning/prototype.
- For public production, consider legal source/provider or official API.

UUID validation:

```ts
export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
```

---

## 17. Environment Variables

```env
DATABASE_URL=
NEXT_PUBLIC_APP_URL=

SHINIGAMI_API_BASE=https://api.shngm.io/v1
SHINIGAMI_WEB_BASE=https://g.shinigami.asia

CRON_SECRET=
```

---

## 18. Development Milestones

### Phase 1 — API Research and Provider

- Create provider types.
- Implement manga list.
- Implement manga detail.
- Implement chapter list.
- Implement genre list.
- Implement format list.
- Implement chapter page scraper.

Deliverable:

```txt
Console/API test can return:
- manga list
- manga detail
- chapter list
- pages[]
```

---

### Phase 2 — Basic UI

- Home page.
- Explore page.
- Detail manga page.
- Reader page.
- Loading and error states.

Deliverable:

```txt
User can browse manga → open detail → choose chapter → read pages.
```

---

### Phase 3 — Database and Search

- Add Prisma/Supabase.
- Sync catalog into database.
- Build internal search.
- Add filters.
- Add chapter page cache.

Deliverable:

```txt
Search works without external search endpoint.
```

---

### Phase 4 — User Features

- Auth.
- Bookmark/library.
- Reading history.
- Continue reading.
- Last chapter progress.

Deliverable:

```txt
User can save manga and continue reading.
```

---

### Phase 5 — Polish and Deploy

- Mobile responsive.
- Dark mode.
- Reader settings.
- Rate limit.
- Error monitoring.
- Deploy to Vercel/Cloudflare.

Deliverable:

```txt
MVP ready for private testing.
```

---

## 19. Minimal MVP Checklist

```txt
[ ] Setup Next.js + TypeScript + Tailwind
[ ] Install cheerio
[ ] Create Shinigami provider
[ ] Create /api/shinigami/manga
[ ] Create /api/shinigami/manga/[mangaId]
[ ] Create /api/shinigami/manga/[mangaId]/chapters
[ ] Create /api/shinigami/chapter/[chapterId]/pages
[ ] Create home page
[ ] Create explore page
[ ] Create manga detail page
[ ] Create reader page
[ ] Render pages with vertical scroll
[ ] Add basic loading states
[ ] Add basic error states
[ ] Add search from local/database data
```

---

## 20. Prompt for Vibe Coding

Use this prompt to continue development with an AI coding assistant:

```txt
Build a Next.js TypeScript manga/manhwa/manhua reader app named PanelHarth.

Use Shinigami as the first provider.

Base API:
https://api.shngm.io/v1

Endpoints:
1. Manga list:
GET /manga/list?page=1&page_size=24&genre_include_mode=or&genre_exclude_mode=or&sort=latest&sort_order=desc

2. Manga detail:
GET /manga/detail/{manga_id}

3. Chapter list:
GET /chapter/{manga_id}/list?page=1&page_size=24&sort_by=chapter_number&sort_order=desc

4. Genre list:
GET /genre/list

5. Format list:
GET /format/list?page=1

Reader:
Use https://g.shinigami.asia/chapter/{chapter_id}, fetch the HTML server-side, parse it using Cheerio, extract all image src values containing assets.shngm.id/chapter, sort them by page number, and render them in a vertical webtoon reader.

App routes:
- /
- /explore
- /manga/[mangaId]
- /read/[chapterId]
- /search
- /library
- /history

Internal API routes:
- /api/shinigami/manga
- /api/shinigami/manga/[mangaId]
- /api/shinigami/manga/[mangaId]/chapters
- /api/shinigami/chapter/[chapterId]/pages
- /api/shinigami/genres
- /api/shinigami/formats

Use a provider abstraction so more sources can be added later.

Use Tailwind CSS and shadcn/ui for a modern black-and-white UI with clean cards, smooth spacing, and mobile-first layout.

For MVP, search can be implemented from the synced database or cached catalog data, not from a remote search endpoint.

Do not reupload chapter images. Store only metadata and image URLs.
```

---

## 21. Final Recommendation

Untuk MVP, gunakan kombinasi:

```txt
Shinigami API
+ HTML reader image scraping
+ own database search
```

Priority build order:

```txt
1. Manga list
2. Manga detail
3. Chapter list
4. Reader pages scraper
5. Vertical reader UI
6. Search internal
7. Bookmark/history
```

Ini sudah cukup untuk membuat web baca komik yang benar-benar bisa dipakai untuk membaca chapter.
