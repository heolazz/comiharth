import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache on Vercel CDN for 1 hour


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") || "shinigami";

    if (source === "komikcast") {
      const headers = { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://komikcast.cc/",
        "Origin": "https://komikcast.cc",
        "Accept": "application/json, text/plain, */*",
        "X-Forwarded-For": `114.125.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      };
      const res = await fetch("https://be.komikcast.cc/series?preset=banner&includeMeta=true", { next: { revalidate: 3600 }, headers });
      if (!res.ok) throw new Error("Failed to fetch banner from komikcast");
      const json = await res.json();
      
      const mappedData = (Array.isArray(json.data) ? json.data : []).map((item: any) => {
        const data = item.data || {};
        return {
          manga_id: data.slug || String(item.id),
          title: data.title,
          cover_portrait_url: data.coverImage,
          cover_image_url: data.backgroundImage || data.coverImage,
          description: data.synopsis,
          latest_chapter_number: data.chapterIndex,
        };
      });

      return NextResponse.json({ success: true, data: mappedData });
    }

    // Default: Shinigami
    const res = await fetch("https://api.shngm.io/v1/manga/top?filter=daily&page=1&page_size=5");
    if (!res.ok) throw new Error("Failed to fetch trending from shinigami");
    const data = await res.json();
    
    const SHINIGAMI_NEWS_ID = "eda86a93-42fc-4442-a672-da8f1c2f5624";
    const filteredData = (data.data || []).filter((item: any) => item.manga_id !== SHINIGAMI_NEWS_ID);
    
    return NextResponse.json({ success: true, data: filteredData });
  } catch (error: any) {
    console.error("Trending API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
