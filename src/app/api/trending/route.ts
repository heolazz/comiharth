import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
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
