# ComiHarth

ComiHarth is a premium, responsive, and modern Web Comic Reader (Manga, Manhwa, Manhua) built with Next.js 15 App Router. The application features a cinematic dark mode interface accented with ComiHarth's signature green color (`#00C853`).

## Key Features

- **Cinematic Hero Slider:** Spotlights trending comics with blurred backdrops and smooth poster animations.
- **Premium Web Reader UI:** An optimized Webtoon-style scrolling reader designed for a seamless reading experience on both desktop and mobile devices.
- **Reading History:** Uses local storage to cache reading progress, allowing users to quickly resume reading directly from the home page.
- **Dynamic Comment Section:** Integrates a dynamic comments section proxied through the Shinigami API, featuring smooth anchor-based scrolling.
- **Ecosystem Integration (KinoHarth):**
  - Seamless ecosystem redirection to **KinoHarth** (a free anime streaming sister platform).
  - Features an interactive, pulsating green online status indicator badge in the footer.
  - Houses a custom, high-fidelity Ghibli-themed promotional banner at the bottom of the home page with a large partner logo and matching green glow accents.

## Tech Stack & Core Dependencies

| Technology | Description |
| :--- | :--- |
| **Next.js 15** | Core framework with App Router, server component rendering, and optimized performance. |
| **React 19** | Component-driven user interface library. |
| **Tailwind CSS v4** | Modern utility-first CSS framework for clean, responsive designs. |
| **Framer Motion** | Animation engine for premium, fluid, and hardware-accelerated UI transitions. |
| **Lucide React** | High-quality, scalable SVG vector icons. |

## Project Structure

```bash
ComiHarth/
├── src/
│   ├── app/                 # Next.js App Router Pages & Styles
│   │   ├── page.tsx         # Home page featuring trending slider & KinoHarth Banner
│   │   ├── globals.css      # Global styles, variables, and dark mode configuration
│   │   └── layout.tsx       # Root layout file
│   └── components/          # Reusable React components
│       ├── layout/          # Header, Footer (housing the KinoHarth Badge)
│       └── ui/              # ComicGrid, SearchBar, SkeletonLoader, etc.
├── public/                  # Static assets
│   ├── logo.png             # Official ComiHarth branding logo
│   ├── logo-kinoharth.png   # Partner KinoHarth branding logo (Large)
│   ├── banner-watch.png     # Custom Ghibli-themed partner promotion banner
│   └── logo-favicon.ico     # Favicon configuration
└── .gitignore               # Ignored files (includes local markdown and planning files)
```

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/heolazz/comiharth.git
cd comiharth
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

## Ecosystem Redirection
- **ComiHarth (Manga Reader):** [comiharth.online](https://comiharth.online)
- **KinoHarth (Anime Streaming):** [kinoharth.online](https://kinoharth.online)

## License
Copyright © 2026 **ComiHarth & KinoHarth Ecosystem**. All rights reserved.
