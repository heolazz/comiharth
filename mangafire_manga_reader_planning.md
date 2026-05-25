# Planning Web Manga Reader dengan MangaFire

> Tujuan dokumen ini adalah menjadi blueprint untuk membangun web baca komik, manga, manhwa, dan manhua menggunakan MangaFire sebagai sumber utama chapter dan page image. Dokumen ini dibuat agar mudah diteruskan ke AI coding seperti Cursor, Claude, ChatGPT, atau tools vibe coding lain.

---

## 1. Gambaran Project

Project ini adalah web manga reader yang memungkinkan user untuk:

- Mencari komik, manga, manhwa, dan manhua.
- Melihat detail judul seperti cover, sinopsis, status, genre, tipe, author, dan daftar chapter.
- Membaca chapter dalam mode reader vertical scroll.
- Menyimpan favorit atau library.
- Melanjutkan bacaan terakhir.
- Melihat reading history.
- Mengatur mode baca seperti webtoon mode, manga mode, image width, dan dark mode.

Source utama reader menggunakan MangaFire karena data chapter di MangaDex kurang lengkap untuk kebutuhan project ini.

---

## 2. Catatan Penting Legalitas dan Stabilitas

MangaFire bukan API resmi publik seperti AniList atau MangaDex. Kebanyakan implementasi MangaFire API bekerja dengan cara scraping dari website MangaFire.

Konsekuensi:

- Struktur website MangaFire bisa berubah sewaktu-waktu.
- Endpoint scraper bisa rusak jika MangaFire mengubah HTML, token, atau sistem proteksi gambar.
- Ada risiko rate limit, Cloudflare block, atau anti-bot protection.
- Ada risiko copyright jika web dipublikasikan untuk umum.
- Jangan re-upload gambar chapter ke server sendiri kecuali punya izin atau source legal.

Rekomendasi:

- Pakai MangaFire sebagai provider adapter, bukan langsung hardcode di seluruh project.
- Siapkan fallback provider di masa depan.
- Simpan data user saja di database, bukan menyimpan semua image chapter.
- Gunakan cache secukupnya untuk metadata, bukan untuk mendistribusikan ulang konten secara ilegal.

---

## 3. Target MVP

MVP adalah versi awal yang cukup untuk membuktikan web reader bisa berjalan.

### Fitur MVP

1. Home page
2. Search manga/manhwa/manhua
3. Detail page
4. Chapter list
5. Reader page
6. Favorite atau bookmark sederhana
7. Reading history sederhana
8. Continue reading
9. Dark mode
10. Responsive mobile layout

### Fitur yang Ditunda

- Comment per chapter
- Rating user
- Offline download
- Multi-provider advanced matching
- Admin dashboard
- Notification update chapter
- Social login lengkap
- Manga recommendation engine

---

## 4. Rekomendasi Tech Stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React
- next-themes

### Backend

- Next.js Route Handler untuk API internal
- Provider adapter untuk MangaFire
- Zod untuk validasi response
- Server-side fetch agar source API tidak langsung terekspos di frontend

### Database

Pilihan 1:

- Supabase PostgreSQL
- Supabase Auth

Pilihan 2:

- Neon PostgreSQL
- Prisma ORM
- Auth.js

Rekomendasi untuk project cepat:

- Supabase Auth + Supabase PostgreSQL

Rekomendasi untuk struktur lebih scalable:

- Prisma + PostgreSQL + Auth.js

---

## 5. Arsitektur Sistem

```txt
User Browser
   ↓
Next.js Frontend
   ↓
Next.js API Routes / Route Handlers
   ↓
Provider Adapter Layer
   ↓
MangaFire API / MangaFire Scraper Service
   ↓
MangaFire Source
```

Untuk metadata tambahan:

```txt
Next.js API Routes
   ↓
AniList GraphQL API
```

Untuk data user:

```txt
Next.js App
   ↓
Database
   ↓
users / favorites / reading_history / bookmarks
```

---

## 6. Kenapa Harus Pakai Provider Adapter

Jangan panggil MangaFire langsung dari semua halaman.

Buruk:

```txt
page.tsx langsung fetch MangaFire
reader.tsx langsung fetch MangaFire
search.tsx langsung fetch MangaFire
```

Bagus:

```txt
app/api/search/route.ts
app/api/comic/[provider]/[id]/route.ts
app/api/chapter/[provider]/[chapterId]/route.ts

lib/providers/mangafire.ts
lib/providers/types.ts
```

Dengan begitu, kalau MangaFire error atau ingin tambah source lain seperti Comick, MangaDex, Asura, MangaKakalot, tinggal tambah provider baru.

---

## 7. Struktur Folder Project

```txt
src/
  app/
    page.tsx
    search/
      page.tsx
    comic/
      [provider]/
        [id]/
          page.tsx
    read/
      [provider]/
        [chapterId]/
          page.tsx
    library/
      page.tsx
    history/
      page.tsx
    api/
      search/
        route.ts
      comic/
        [provider]/
          [id]/
            route.ts
      chapters/
        [provider]/
          [id]/
            route.ts
      pages/
        [provider]/
          [chapterId]/
            route.ts
      anilist/
        search/
          route.ts

  components/
    layout/
      Navbar.tsx
      Footer.tsx
      MobileNav.tsx
    comic/
      ComicCard.tsx
      ComicGrid.tsx
      ComicHeader.tsx
      ChapterList.tsx
      GenreBadge.tsx
    reader/
      ReaderToolbar.tsx
      ReaderImage.tsx
      ReaderSettings.tsx
      ChapterNavigation.tsx
      ReaderSkeleton.tsx
    ui/
      ...shadcn components

  lib/
    providers/
      types.ts
      mangafire.ts
      anilist.ts
      index.ts
    db/
      prisma.ts
      supabase.ts
    utils/
      slug.ts
      image.ts
      cache.ts
      normalize.ts

  types/
    comic.ts
    chapter.ts
    user.ts
```

---

## 8. Data Model Internal

Buat format data internal agar semua provider menghasilkan bentuk data yang sama.

### Comic Search Result

```ts
export type ComicSearchResult = {
  id: string;
  provider: "mangafire" | "mangadex" | "comick";
  title: string;
  altTitles?: string[];
  cover?: string;
  type?: "manga" | "manhwa" | "manhua" | "comic" | "unknown";
  status?: "ongoing" | "completed" | "hiatus" | "unknown";
  latestChapter?: string;
  url?: string;
};
```

### Comic Detail

```ts
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
```

### Chapter

```ts
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
```

### Chapter Pages

```ts
export type ChapterPages = {
  chapterId: string;
  provider: string;
  pages: string[];
  nextChapterId?: string;
  previousChapterId?: string;
};
```

---

## 9. Provider Interface

Buat interface umum untuk semua provider.

```ts
export interface MangaProvider {
  name: string;

  search(query: string, page?: number): Promise<ComicSearchResult[]>;

  getDetails(id: string): Promise<ComicDetail>;

  getChapters(id: string, options?: {
    language?: string;
    page?: number;
  }): Promise<Chapter[]>;

  getPages(chapterId: string): Promise<ChapterPages>;
}
```

---

## 10. MangaFire Provider Plan

MangaFire provider bertugas untuk:

- Search title
- Ambil detail manga
- Ambil daftar chapter
- Ambil image pages dari chapter
- Normalize data ke format internal
- Handle error jika source berubah

### Endpoint Konseptual

Jika memakai MangaFire API wrapper, biasanya endpoint yang dibutuhkan:

```txt
GET /api/search/:keyword?page=1
GET /api/manga/:id
GET /api/manga/:id/chapters/:language
GET /api/chapter/:chapterId
GET /api/home
GET /api/category/:category?page=1
GET /api/genre/:genre?page=1
```

Catatan:

Endpoint bisa berbeda tergantung repo atau wrapper yang kamu pakai. Jadi jangan terlalu bergantung ke satu format. Buat file `mangafire.ts` yang mudah diedit.

---

## 11. Pilihan Implementasi MangaFire

Ada 2 pendekatan.

### Opsi A — Pakai MangaFire API Wrapper Existing

Kamu deploy API wrapper MangaFire sebagai backend terpisah.

```txt
Next.js App
   ↓
MangaFire API Wrapper
   ↓
MangaFire.to
```

Kelebihan:

- Next.js frontend lebih bersih.
- Logic scraping dipisah.
- Bisa debug source API secara terpisah.
- Jika pakai FastAPI/Express, lebih mudah handle Playwright jika dibutuhkan.

Kekurangan:

- Perlu deploy service tambahan.
- Kalau butuh Playwright/headless browser, deployment lebih berat.
- Tidak semua platform serverless cocok untuk scraping berat.

### Opsi B — Buat Scraper Langsung di Next.js API Route

```txt
Next.js API Route
   ↓
Scrape MangaFire
```

Kelebihan:

- Satu project saja.
- Lebih cepat untuk MVP.

Kekurangan:

- Bisa bermasalah di Vercel/Cloudflare jika butuh headless browser.
- Lebih susah maintain jika scraping makin kompleks.
- Risiko block lebih tinggi.

### Rekomendasi

Untuk kamu, gunakan:

```txt
Opsi A: MangaFire API Wrapper terpisah
```

Alasan:

- Lebih rapi untuk jangka panjang.
- Next.js fokus ke UI dan user data.
- MangaFire logic bisa diganti tanpa mengganggu frontend.
- Jika nanti perlu Playwright untuk bypass token atau descramble image, backend terpisah lebih fleksibel.

---

## 12. API Internal Next.js

Walaupun ada MangaFire API wrapper, frontend jangan langsung memanggil wrapper tersebut. Tetap buat API internal.

### Search API

```txt
GET /api/search?q=solo%20leveling&provider=mangafire&page=1
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "solo-leveling.abc123",
      "provider": "mangafire",
      "title": "Solo Leveling",
      "cover": "https://...",
      "type": "manhwa",
      "status": "completed",
      "latestChapter": "Chapter 200"
    }
  ]
}
```

### Comic Detail API

```txt
GET /api/comic/mangafire/solo-leveling.abc123
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "solo-leveling.abc123",
    "provider": "mangafire",
    "title": "Solo Leveling",
    "cover": "https://...",
    "description": "...",
    "genres": ["Action", "Fantasy"],
    "status": "completed",
    "type": "manhwa"
  }
}
```

### Chapter List API

```txt
GET /api/chapters/mangafire/solo-leveling.abc123?language=en
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "solo-leveling-chapter-1.xyz",
      "provider": "mangafire",
      "comicId": "solo-leveling.abc123",
      "title": "Chapter 1",
      "chapterNumber": "1",
      "language": "en"
    }
  ]
}
```

### Chapter Pages API

```txt
GET /api/pages/mangafire/solo-leveling-chapter-1.xyz
```

Response:

```json
{
  "success": true,
  "data": {
    "chapterId": "solo-leveling-chapter-1.xyz",
    "provider": "mangafire",
    "pages": [
      "https://.../page-1.jpg",
      "https://.../page-2.jpg"
    ]
  }
}
```

---

## 13. Reader Page Behavior

Route:

```txt
/read/[provider]/[chapterId]
```

Contoh:

```txt
/read/mangafire/solo-leveling-chapter-1.xyz
```

Reader harus punya:

- Full width dark background.
- Image lazy loading.
- Skeleton loading.
- Error state.
- Retry button.
- Top toolbar auto-hide.
- Next chapter button.
- Previous chapter button.
- Reading progress.
- Save reading history otomatis.
- Save page position optional.

Untuk manhwa/manhua:

```txt
Default reader mode: vertical webtoon scroll
```

Untuk manga Jepang:

```txt
Optional mode: single page / paginated / right-to-left
```

---

## 14. UI Pages Detail

### Home Page

Isi:

- Hero section
- Search bar besar
- Latest update
- Popular manga/manhwa/manhua
- Genre shortcuts
- Continue reading jika user login

Komponen:

```txt
HeroSection
SearchBar
ComicCarousel
ComicGrid
ContinueReadingSection
GenrePills
```

### Search Page

Isi:

- Search input
- Filter provider
- Filter type: manga/manhwa/manhua
- Filter status
- Result grid
- Empty state
- Loading state

### Comic Detail Page

Isi:

- Cover
- Title
- Alternative title
- Description
- Genre
- Status
- Type
- Author
- Button Start Reading
- Button Add to Library
- Chapter list

### Reader Page

Isi:

- Reader toolbar
- Chapter title
- Image pages
- Reader settings
- Previous/next chapter navigation

### Library Page

Isi:

- Favorite list
- Continue reading
- Reading progress

### History Page

Isi:

- Recently read
- Last chapter
- Last read time
- Continue button

---

## 15. Database Schema Prisma

Jika pakai Prisma, schema awal:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  favorites      Favorite[]
  readingHistory ReadingHistory[]
  bookmarks      Bookmark[]
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  provider  String
  comicId   String
  title     String
  cover     String?
  type      String?
  status    String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, provider, comicId])
}

model ReadingHistory {
  id            String   @id @default(cuid())
  userId        String
  provider      String
  comicId       String
  comicTitle    String
  comicCover    String?
  chapterId     String
  chapterTitle  String?
  chapterNumber String?
  pageIndex     Int      @default(0)
  progress      Float    @default(0)
  lastReadAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, provider, comicId])
}

model Bookmark {
  id            String   @id @default(cuid())
  userId        String
  provider      String
  comicId       String
  comicTitle    String
  chapterId     String
  chapterTitle  String?
  pageIndex     Int
  note          String?
  createdAt     DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 16. Supabase Table Alternative

Jika tidak pakai Prisma, buat table:

### favorites

```sql
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null,
  comic_id text not null,
  title text not null,
  cover text,
  type text,
  status text,
  created_at timestamp with time zone default now(),
  unique(user_id, provider, comic_id)
);
```

### reading_history

```sql
create table reading_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null,
  comic_id text not null,
  comic_title text not null,
  comic_cover text,
  chapter_id text not null,
  chapter_title text,
  chapter_number text,
  page_index int default 0,
  progress numeric default 0,
  last_read_at timestamp with time zone default now(),
  unique(user_id, provider, comic_id)
);
```

### bookmarks

```sql
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null,
  comic_id text not null,
  comic_title text not null,
  chapter_id text not null,
  chapter_title text,
  page_index int not null,
  note text,
  created_at timestamp with time zone default now()
);
```

---

## 17. Caching Strategy

Karena source MangaFire bisa lambat dan scraping berat, gunakan caching.

### Cache yang Boleh

- Search result: 5 sampai 15 menit
- Comic detail: 1 sampai 6 jam
- Chapter list: 15 menit sampai 1 jam
- Chapter pages: 5 sampai 30 menit

### Cache yang Sebaiknya Tidak Berlebihan

- Image binary chapter
- Rehosting image
- Permanent storage chapter pages

### Next.js Fetch Cache

```ts
const res = await fetch(url, {
  next: { revalidate: 300 },
});
```

### In-memory Cache Optional

Untuk API wrapper:

```ts
const cache = new Map<string, { data: unknown; expiresAt: number }>();
```

Untuk production lebih proper:

- Upstash Redis
- Cloudflare KV
- Vercel KV

---

## 18. Error Handling

Setiap API internal harus punya format error yang sama.

```json
{
  "success": false,
  "error": {
    "code": "SOURCE_UNAVAILABLE",
    "message": "MangaFire source is currently unavailable. Please try again later."
  }
}
```

Error codes:

```txt
BAD_REQUEST
PROVIDER_NOT_SUPPORTED
COMIC_NOT_FOUND
CHAPTER_NOT_FOUND
SOURCE_UNAVAILABLE
RATE_LIMITED
PARSER_ERROR
UNKNOWN_ERROR
```

Reader page harus menampilkan:

- Tombol retry
- Tombol back to detail
- Pesan bahwa source sedang bermasalah
- Jangan langsung blank page

---

## 19. Environment Variables

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

MANGAFIRE_API_BASE_URL=http://localhost:8000
MANGAFIRE_API_KEY=

ANILIST_API_URL=https://graphql.anilist.co

DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Jika pakai Supabase Auth, tidak perlu `NEXTAUTH_SECRET` dan `NEXTAUTH_URL`.

---

## 20. Development Phases

### Phase 1 — Setup Project

Target:

- Setup Next.js
- Setup Tailwind
- Setup shadcn/ui
- Setup theme dark mode
- Setup basic layout

Checklist:

- [ ] Create Next.js project
- [ ] Install Tailwind
- [ ] Install shadcn/ui
- [ ] Install lucide-react
- [ ] Install framer-motion
- [ ] Install next-themes
- [ ] Create Navbar
- [ ] Create Footer
- [ ] Create global layout

---

### Phase 2 — MangaFire API Wrapper

Target:

- Menentukan MangaFire API wrapper yang dipakai
- Test search
- Test detail
- Test chapter list
- Test chapter pages

Checklist:

- [ ] Clone/deploy MangaFire API wrapper
- [ ] Test endpoint search
- [ ] Test endpoint detail
- [ ] Test endpoint chapters
- [ ] Test endpoint pages
- [ ] Buat dokumentasi response aktual
- [ ] Pastikan CORS aman
- [ ] Tambah basic rate limit

---

### Phase 3 — Provider Adapter

Target:

- Buat adapter `mangafire.ts`
- Normalize semua response ke format internal

Checklist:

- [ ] Create `lib/providers/types.ts`
- [ ] Create `lib/providers/mangafire.ts`
- [ ] Implement `search()`
- [ ] Implement `getDetails()`
- [ ] Implement `getChapters()`
- [ ] Implement `getPages()`
- [ ] Add error handling
- [ ] Add response validation with Zod

---

### Phase 4 — API Internal Next.js

Target:

- Frontend hanya memanggil API internal

Checklist:

- [ ] `/api/search`
- [ ] `/api/comic/[provider]/[id]`
- [ ] `/api/chapters/[provider]/[id]`
- [ ] `/api/pages/[provider]/[chapterId]`
- [ ] Standard success response
- [ ] Standard error response
- [ ] Add caching

---

### Phase 5 — Search dan Detail UI

Target:

- User bisa mencari comic
- User bisa membuka detail
- User bisa melihat chapter

Checklist:

- [ ] Search page
- [ ] Comic card component
- [ ] Comic grid component
- [ ] Detail page
- [ ] Chapter list component
- [ ] Chapter sorting ascending/descending
- [ ] Chapter language selector jika tersedia

---

### Phase 6 — Reader Page

Target:

- User bisa baca chapter

Checklist:

- [ ] Reader route
- [ ] Fetch pages
- [ ] Render images vertical scroll
- [ ] Lazy loading image
- [ ] Reader toolbar
- [ ] Next/previous chapter
- [ ] Loading skeleton
- [ ] Error state
- [ ] Save last read locally first

---

### Phase 7 — Auth dan User Data

Target:

- User bisa login
- User bisa menyimpan favorite dan history

Checklist:

- [ ] Setup auth
- [ ] Setup database
- [ ] Favorite comic
- [ ] Remove favorite
- [ ] Save reading history
- [ ] Continue reading
- [ ] Library page
- [ ] History page

---

### Phase 8 — Polish UI/UX

Target:

- Web terasa modern, cepat, dan nyaman dipakai

Checklist:

- [ ] Responsive mobile-first
- [ ] Dark theme reader
- [ ] Smooth animation
- [ ] Empty state
- [ ] Error state
- [ ] Skeleton loading
- [ ] Reader settings
- [ ] SEO metadata
- [ ] OpenGraph image

---

### Phase 9 — Deployment

Target:

- Deploy web dan backend source

Checklist:

- [ ] Deploy Next.js ke Vercel/Cloudflare Pages
- [ ] Deploy MangaFire API wrapper ke VPS/Railway/Render/Fly.io
- [ ] Setup environment variables
- [ ] Setup custom domain
- [ ] Test API production
- [ ] Test reader production
- [ ] Monitor logs

---

## 21. Recommended Deployment

### Next.js Frontend

Rekomendasi:

- Vercel untuk paling mudah
- Cloudflare Pages jika kamu ingin satu ekosistem dengan domain Cloudflare

### MangaFire API Wrapper

Rekomendasi:

- Railway
- Render
- Fly.io
- VPS kecil

Jika wrapper membutuhkan Playwright/headless browser, pilih platform yang mendukung browser runtime. Jangan mengandalkan Vercel serverless untuk scraping berat.

---

## 22. UI Style Direction

Karena kamu sebelumnya suka web anime/movie dengan nuansa clean, gunakan konsep:

```txt
Modern dark manga reader
Black / white / blue accent
Card rounded 2xl
Soft gradient
Minimal but cinematic
```

Palette:

```txt
Background: #050505
Surface: #111111
Surface 2: #18181B
Text: #FAFAFA
Muted Text: #A1A1AA
Border: #27272A
Accent Blue: #3B82F6
Accent Purple optional: #8B5CF6
```

Layout:

- Home tetap visual dan modern.
- Reader page harus sederhana dan tidak ramai.
- Banyak whitespace.
- Fokus utama reader adalah gambar chapter.

---

## 23. Reader UX Detail

Fitur reader setting:

```txt
Image width:
- Fit width
- 720px
- 900px
- 1200px

Mode:
- Webtoon vertical
- Manga single page
- Double page optional

Background:
- Black
- Dark gray
- White

Direction:
- Left to right
- Right to left
```

Default:

```txt
Mode: Webtoon vertical
Background: Black
Image width: Fit width mobile, 900px desktop
```

---

## 24. Performance Notes

Reader chapter bisa berisi banyak gambar. Optimasi penting:

- Pakai `loading="lazy"`.
- Jangan render semua UI berat di tiap image.
- Gunakan plain `img` untuk remote image jika Next Image bermasalah dengan dynamic domains.
- Tambahkan `referrerPolicy="no-referrer"` jika source image butuh.
- Tambahkan retry image jika gagal load.
- Gunakan skeleton sebelum gambar muncul.

Contoh:

```tsx
<img
  src={pageUrl}
  alt={`Page ${index + 1}`}
  loading="lazy"
  referrerPolicy="no-referrer"
  className="mx-auto w-full max-w-[900px]"
/>
```

---

## 25. Security Notes

Karena pakai source eksternal:

- Jangan expose API key backend di frontend.
- Jangan biarkan user memasukkan URL arbitrary untuk di-fetch server karena bisa SSRF.
- Validasi provider hanya dari whitelist.
- Rate limit API internal.
- Sanitasi query search.
- Batasi panjang query.
- Jangan simpan data HTML mentah dari scraper tanpa sanitasi.

Provider whitelist:

```ts
const allowedProviders = ["mangafire", "mangadex", "comick"];
```

---

## 26. Prompt untuk AI Coding

Gunakan prompt ini untuk memulai implementasi:

```txt
Build a Next.js App Router manga reader web app using TypeScript, Tailwind CSS, shadcn/ui, and a provider adapter architecture.

The main provider is MangaFire through an external API wrapper configured by MANGAFIRE_API_BASE_URL. Do not call MangaFire directly from UI components. Create internal API routes:

- GET /api/search?q=&provider=mangafire&page=1
- GET /api/comic/[provider]/[id]
- GET /api/chapters/[provider]/[id]
- GET /api/pages/[provider]/[chapterId]

Create provider types:

- ComicSearchResult
- ComicDetail
- Chapter
- ChapterPages
- MangaProvider interface

Create lib/providers/mangafire.ts that maps external MangaFire API responses into normalized internal data.

Build pages:

- Home page with search and latest/popular sections
- Search page with comic grid
- Comic detail page with chapter list
- Reader page with vertical scroll images, lazy loading, toolbar, loading state, error state, and next/previous navigation placeholder

Use a modern dark UI with black background, white text, subtle borders, rounded cards, and blue accent.

Prioritize MVP first. Use mock fallback data only when API is unavailable, but keep all code ready for real API integration.
```

---

## 27. Risiko Project

### Risiko 1 — MangaFire berubah struktur

Solusi:

- Isolasi logic di provider adapter.
- Jangan hardcode di UI.
- Tambah monitoring error.

### Risiko 2 — Image chapter gagal load

Solusi:

- Gunakan `referrerPolicy="no-referrer"`.
- Tambah retry button.
- Siapkan proxy image hanya jika benar-benar perlu dan legal.

### Risiko 3 — API wrapper tidak stabil

Solusi:

- Fork repo wrapper.
- Deploy sendiri.
- Dokumentasikan response aktual.
- Tambah fallback provider di masa depan.

### Risiko 4 — Copyright

Solusi:

- Jangan reupload konten.
- Jangan klaim konten sebagai milik sendiri.
- Untuk project publik/komersial, pertimbangkan official/legal source.

---

## 28. Roadmap Singkat

```txt
Week 1:
- Setup project
- Setup MangaFire wrapper
- Search + detail + chapter list API

Week 2:
- Reader page
- UI polish
- History local storage

Week 3:
- Auth + database
- Favorite + continue reading

Week 4:
- Deployment
- Error handling
- Cache
- SEO
```

---

## 29. Kesimpulan

Untuk kebutuhan web baca komik yang lebih lengkap dari MangaDex, MangaFire bisa dipakai sebagai source utama. Namun karena MangaFire biasanya diakses lewat scraper/unofficial API, project harus dibuat dengan arsitektur provider adapter agar mudah diperbaiki atau diganti source.

Stack yang disarankan:

```txt
Next.js + TypeScript + Tailwind + shadcn/ui
MangaFire API wrapper sebagai source reader
Supabase/PostgreSQL untuk user data
AniList optional untuk metadata tambahan
```

Prioritas pertama:

```txt
Search → Detail → Chapter List → Reader Page
```

Setelah itu baru tambah:

```txt
Favorite → History → Continue Reading → Auth → Multi-provider
```
