import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache on Vercel CDN for 1 hour


export async function GET(request: Request) {
  try {
    // Fetch all feeds in parallel
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
      fetch("https://api.shngm.io/v1/manga/list?format=manhwa&page=1&page_size=24&sort=latest&sort_order=desc"),
      fetch("https://api.shngm.io/v1/manga/list?format=manga&page=1&page_size=24&sort=latest&sort_order=desc"),
      fetch("https://api.shngm.io/v1/manga/list?format=manhua&page=1&page_size=24&sort=latest&sort_order=desc"),
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
        if (typeStr === 'manga' || typeStr === 'manhwa' || typeStr === 'manhua') return typeStr;
      }
      // Fallback to country_id
      if (item.country_id === 'KR') return 'manhwa';
      if (item.country_id === 'CN') return 'manhua';
      if (item.country_id === 'JP') return 'manga';
      return 'manga'; // Default
    };

    const mapToComic = (item: any) => ({
      id: item.manga_id,
      title: item.title,
      cover: item.cover_portrait_url || item.cover_image_url || "",
      provider: "shinigami",
      type: getComicType(item),
      status: item.status === 1 ? "ongoing" : item.status === 2 ? "completed" : "unknown",
      latestChapter: item.latest_chapter_number ? `Chapter ${item.latest_chapter_number}` : "",
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
          manhwa: filterValidComics(recentManhwa.data || []).map(mapToComic),
          manga: filterValidComics(recentManga.data || []).map(mapToComic),
          manhua: filterValidComics(recentManhua.data || []).map(mapToComic)
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
