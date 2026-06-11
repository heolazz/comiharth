import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache on Vercel CDN for 1 hour


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") || "shinigami";

    if (source === "komikcast") {
      const GAS_PROXY_URL = "https://script.google.com/macros/s/AKfycbxcSrY6mQ_hHBvsMk9Qs96BwK5vVImJg6h3zCMGHE3HEBS-g089sMO5wprVHk2bydTPTA/exec";
      const proxyUrl = (url: string) => {
        const isDev = process.env.NODE_ENV === "development";
        return isDev ? url : `${GAS_PROXY_URL}?url=${encodeURIComponent(url)}`;
      };
      
      const fetchProxy = async (url: string) => {
        const res = await fetch(proxyUrl(url), { next: { revalidate: 3600 } });
        const json = await res.json();
        const isDev = process.env.NODE_ENV === "development";
        if (!isDev && json.error) throw new Error(json.error);
        return json;
      };

      const [
        popularJson,
        recentManhwaJson,
        recentMangaJson,
        recentManhuaJson
      ] = await Promise.all([
        fetchProxy("https://be.komikcast.cc/series?preset=popular_all&take=50&takeChapter=2&includeMeta=true"),
        fetchProxy("https://be.komikcast.cc/series?format=manhwa&takeChapter=2&includeMeta=true&sort=latest&sortOrder=desc&take=30&page=1"),
        fetchProxy("https://be.komikcast.cc/series?format=manga&takeChapter=2&includeMeta=true&sort=latest&sortOrder=desc&take=30&page=1"),
        fetchProxy("https://be.komikcast.cc/series?format=manhua&takeChapter=2&includeMeta=true&sort=latest&sortOrder=desc&take=30&page=1")
      ]);

      const getComicType = (format?: string) => {
        if (!format) return "manhwa";
        const lowerFormat = format.toLowerCase();
        if (lowerFormat.includes("manga")) return "manga";
        if (lowerFormat.includes("manhwa") || lowerFormat.includes("webtoon")) return "manhwa";
        if (lowerFormat.includes("manhua")) return "manhua";
        return "manhwa";
      };

      const mapToComic = (item: any) => {
        const data = item.data || {};
        
        // Extract latest chapter from the chapters array (if included via takeChapter=2) or use totalChapters
        const chapterNum = item.chapters?.[0]?.chapterIndex ?? item.chapters?.[0]?.data?.index ?? data.totalChapters ?? data.chapterIndex ?? data.index;
        
        return {
          id: data.slug || String(item.id),
          title: data.title,
          cover: data.coverImage || data.thumbnail || "",
          provider: "komikcast",
          type: getComicType(data.format),
          status: data.status?.toLowerCase() === "ongoing" ? "ongoing" : "completed",
          latestChapter: chapterNum ? "Chapter " + chapterNum : "",
          rating: typeof data.rating === "number" ? data.rating.toString() : (data.rating || "N/A")
        };
      };

      const popularData = (Array.isArray(popularJson.data) ? popularJson.data : []).map(mapToComic);
      const recentManhwaData = (Array.isArray(recentManhwaJson.data) ? recentManhwaJson.data : []).map(mapToComic).slice(0, 24);
      const recentMangaData = (Array.isArray(recentMangaJson.data) ? recentMangaJson.data : []).map(mapToComic).slice(0, 24);
      const recentManhuaData = (Array.isArray(recentManhuaJson.data) ? recentManhuaJson.data : []).map(mapToComic).slice(0, 24);

      return NextResponse.json({
        success: true,
        data: {
          recommended: {
            manhwa: popularData.filter((c: any) => c.type === "manhwa").slice(0, 12),
            manga: popularData.filter((c: any) => c.type === "manga").slice(0, 12),
            manhua: popularData.filter((c: any) => c.type === "manhua").slice(0, 12)
          },
          recent: {
            manhwa: recentManhwaData,
            manga: recentMangaData,
            manhua: recentManhuaData
          },
          popular: {
            daily: popularData.slice(0, 12),
            weekly: popularData.slice(0, 12),
            allTime: popularData
          }
        }
      });
    }

    // Default: Shinigami
    const [
      recManhwaRes,
      recMangaRes,
      recManhuaRes,
      recentManhwaRes,
      recentMangaRes,
      recentManhuaRes,
      popularDailyRes,
      popularWeeklyRes,
      popularAllTimeRes
    ] = await Promise.all([
      fetch("https://api.shngm.io/v1/manga/list?format=manhwa&page=1&page_size=12&is_recommended=true&sort=latest&sort_order=desc"),
      fetch("https://api.shngm.io/v1/manga/list?format=manga&page=1&page_size=12&is_recommended=true&sort=latest&sort_order=desc"),
      fetch("https://api.shngm.io/v1/manga/list?format=manhua&page=1&page_size=12&is_recommended=true&sort=latest&sort_order=desc"),
      fetch("https://api.shngm.io/v1/manga/list?format=manhwa&page=1&page_size=30&sort=latest&sort_order=desc"),
      fetch("https://api.shngm.io/v1/manga/list?format=manga&page=1&page_size=30&sort=latest&sort_order=desc"),
      fetch("https://api.shngm.io/v1/manga/list?format=manhua&page=1&page_size=30&sort=latest&sort_order=desc"),
      fetch("https://api.shngm.io/v1/manga/top?filter=daily&page=1&page_size=12"),
      fetch("https://api.shngm.io/v1/manga/top?filter=weekly&page=1&page_size=12"),
      fetch("https://api.shngm.io/v1/manga/top?filter=all_time&page=1&page_size=12")
    ]);

    const [
      recManhwa,
      recManga,
      recManhua,
      recentManhwa,
      recentManga,
      recentManhua,
      popularDaily,
      popularWeekly,
      popularAllTime
    ] = await Promise.all([
      recManhwaRes.json(),
      recMangaRes.json(),
      recManhuaRes.json(),
      recentManhwaRes.json(),
      recentMangaRes.json(),
      recentManhuaRes.json(),
      popularDailyRes.json(),
      popularWeeklyRes.json(),
      popularAllTimeRes.json()
    ]);

    const getComicType = (item: any) => {
      // First try to check taxonomy formats if they exist
      const formats = item.taxonomy?.Format || item.taxonomy?.format || [];
      if (formats.length > 0) {
        const typeStr = formats[0].name?.toLowerCase();
        if (typeStr === "manga" || typeStr === "manhwa" || typeStr === "manhua") return typeStr;
      }
      // Fallback to country_id
      if (item.country_id === "KR") return "manhwa";
      if (item.country_id === "CN") return "manhua";
      if (item.country_id === "JP") return "manga";
      return "manga"; // Default
    };

    const mapToComic = (item: any) => ({
      id: item.manga_id,
      title: item.title,
      cover: item.cover_portrait_url || item.cover_image_url || "",
      provider: "shinigami",
      type: getComicType(item),
      status: item.status === 1 ? "ongoing" : item.status === 2 ? "completed" : "unknown",
      latestChapter: item.latest_chapter_number ? "Chapter " + item.latest_chapter_number : "",
      rating: item.user_rate ? item.user_rate.toString() : "N/A"
    });

    const SHINIGAMI_NEWS_ID = "eda86a93-42fc-4442-a672-da8f1c2f5624";
    
    const filterValidComics = (items: any[]) => {
      return items.filter((item) => item.manga_id !== SHINIGAMI_NEWS_ID);
    };

    // Do not combine, return separately
    const manhwaData = filterValidComics(recManhwa.data || []).map(mapToComic);
    const mangaData = filterValidComics(recManga.data || []).map(mapToComic);
    const manhuaData = filterValidComics(recManhua.data || []).map(mapToComic);

    return NextResponse.json({
      success: true,
      data: {
        recommended: {
          manhwa: manhwaData,
          manga: mangaData,
          manhua: manhuaData
        },
        recent: {
          manhwa: filterValidComics(recentManhwa.data || []).map(mapToComic).slice(0, 24),
          manga: filterValidComics(recentManga.data || []).map(mapToComic).slice(0, 24),
          manhua: filterValidComics(recentManhua.data || []).map(mapToComic).slice(0, 24)
        },
        popular: {
          daily: filterValidComics(popularDaily.data || []).map(mapToComic),
          weekly: filterValidComics(popularWeekly.data || []).map(mapToComic),
          allTime: filterValidComics(popularAllTime.data || []).map(mapToComic)
        }
      }
    });
  } catch (error: any) {
    console.error("Home Feed API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
