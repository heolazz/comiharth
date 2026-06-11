import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache on Vercel CDN for 1 hour


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") || "shinigami";

    if (source === "komikcast") {
      const GAS_PROXY_URL = "https://script.google.com/macros/s/AKfycbxcSrY6mQ_hHBvsMk9Qs96BwK5vVImJg6h3zCMGHE3HEBS-g089sMO5wprVHk2bydTPTA/exec";
      const targetUrl = "https://be.komikcast.cc/series?preset=banner&includeMeta=true";
      const isDev = process.env.NODE_ENV === "development";
      const proxyUrl = isDev ? targetUrl : `${GAS_PROXY_URL}?url=${encodeURIComponent(targetUrl)}`;
      
      const res = await fetch(proxyUrl, { next: { revalidate: 3600 } });
      const json = await res.json();
      if (!isDev && json.error) throw new Error(json.error);
      
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
