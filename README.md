# 📚 ComiHarth

> **ComiHarth** adalah platform Web Comic Reader (Manga, Manhwa, Manhua) premium, modern, dan sangat responsif. Didesain menggunakan **Next.js 15 App Router** dengan antarmuka sinematik gelap (*dark mode*) yang memukau dan dihiasi aksen warna hijau khas (`#00C853`).

---

## ✨ Fitur Utama

- 🎬 **Cinematic Hero Slider:** Menampilkan komik terpopuler (*trending*) dengan efek latar belakang buram (*blurred backdrop*) dan animasi poster yang halus.
- 📖 **Premium Web Reader UI:** Halaman pembaca komik bergaya *Webtoon scrolling* yang dirancang secara khusus untuk kenyamanan membaca di desktop maupun perangkat mobile.
- ⏱️ **Reading History (Riwayat Membaca):** Menyimpan riwayat bacaan terakhir Anda secara lokal sehingga Anda dapat melanjutkan petualangan membaca langsung dari halaman beranda (*Home*).
- 💬 **Dynamic Comment Section:** Integrasi section komentar yang dinamis, terhubung via Shinigami API proxy, lengkap dengan transisi *smooth scrolling* saat tombol ulasan diklik.
- 🍃 **Sister Site Ecosystem Integration (KinoHarth):**
  * Kolaborasi ekosistem bersama **KinoHarth** (Platform Streaming Anime gratis terpopuler).
  * Dilengkapi dengan *Footer Badge* berkedip (*pulsing dot*) yang interaktif.
  * Dilengkapi dengan **Ghibli-themed Banner** sinematik di bagian paling bawah halaman utama yang memikat menggunakan visual ajaib Ghibli dan integrasi logo berukuran besar.

---

## 🛠️ Tech Stack & Dependencies

| Teknologi | Keterangan |
| :--- | :--- |
| **Next.js 15** | Framework React utama dengan App Router & server-side rendering support. |
| **React 19** | Library JavaScript untuk membangun antarmuka pengguna berbasis komponen. |
| **Tailwind CSS v4** | Framework utilitas CSS modern untuk desain yang bersih dan responsif. |
| **Framer Motion** | Engine animasi berkualitas tinggi untuk transisi UI yang premium dan hidup. |
| **Lucide React** | Library ikon vektor premium yang tajam dan bersih. |

---

## 📂 Struktur Proyek

```bash
ComiHarth/
├── src/
│   ├── app/                 # Next.js App Router Pages (Home, Library, Read, History, dll.)
│   │   ├── page.tsx         # Halaman Utama (Home) dengan slider & KinoHarth Banner
│   │   ├── globals.css      # Styling CSS global dan definisi variabel warna
│   │   └── layout.tsx       # Layout utama aplikasi
│   └── components/          # Reusable UI Components
│       ├── layout/          # Header, Footer (dengan KinoHarth Badge)
│       └── ui/              # ComicGrid, SearchBar, SkeletonLoader, dll.
├── public/                  # Static Assets
│   ├── logo.png             # Logo resmi ComiHarth
│   ├── logo-kinoharth.png   # Logo resmi partner KinoHarth (Large)
│   ├── banner-watch.png     # Banner promosi bertema Ghibli
│   └── logo-favicon.ico     # Favicon aplikasi
└── .gitignore               # Daftar file yang diabaikan oleh Git (Termasuk berkas perencanaan/MD)
```

---

## 🚀 Panduan Memulai (Development Setup)

### 1. Kloning Repositori
```bash
git clone https://github.com/heolazz/comiharth.git
cd comiharth
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Jalankan Server Development
```bash
npm run dev
```
Setelah berjalan, buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

---

## 🌐 Ekosistem Sister-Site
* 📖 **ComiHarth (Manga Reader):** [comiharth.online](https://comiharth.online)
* 🎬 **KinoHarth (Anime Streaming):** [kinoharth.online](https://kinoharth.online)

---

## 📄 Lisensi
Hak Cipta © 2026 **ComiHarth & KinoHarth Ecosystem**. Seluruh hak dilindungi undang-undang.
