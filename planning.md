# Planning Web Manga Reader - ComiHarth

> blueprint untuk membangun web baca komik, manga, manhwa, dan manhua menggunakan MangaFire sebagai sumber utama chapter dan page image.

---

## 1. Gambaran Project

Project ini adalah web manga reader bernama **ComiHarth** yang memungkinkan user untuk:

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
- Supabase Auth + Supabase PostgreSQL

---

## 5. Arsitektur Sistem

```txt
User Browser
   ↓
Next.js Frontend (ComiHarth)
   ↓
Next.js API Routes / Route Handlers
   ↓
Provider Adapter Layer
   ↓
MangaFire API / MangaFire Scraper Service
   ↓
MangaFire Source
```

---

## 6. Struktur Folder Project

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
    reader/
      ReaderToolbar.tsx
      ReaderImage.tsx
      ReaderSettings.tsx
      ChapterNavigation.tsx
    ui/
      ...shadcn components

  lib/
    providers/
      types.ts
      mangafire.ts
      index.ts
    utils/
      slug.ts
      image.ts
      cache.ts
```

---

## 7. UI Style Direction

Sesuai preferensi visual yang cinematic dan modern:

```txt
Modern dark manga reader
Black / white / blue accent
Card rounded 2xl
Soft gradient
Minimal but cinematic
```

Palette:
- Background: `#050505` (Deep Slate-Black)
- Surface: `#111111`
- Text: `#FAFAFA`
- Accent: `#3B82F6` (Electric Blue)
