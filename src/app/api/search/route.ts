import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const providerName = searchParams.get("provider") || "shinigami";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const format = searchParams.get("format") || "";
    const genre = searchParams.get("genre") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "";
    const action = searchParams.get("action");

    if (action === "genres" && providerName === "komikcast") {
      const res = await fetch("https://be.komikcast.cc/genres", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 86400 } // Cache for 24 hours
      });
      if (!res.ok) throw new Error("Failed to fetch genres");
      const json = await res.json();
      return NextResponse.json(json);
    }

    if (!query && !format && !genre && !status) {
      return NextResponse.json({ success: true, data: [] });
    }

    const provider = getProvider(providerName);
    const { results, totalCount } = await provider.search(query, page, format, genre, status, sort);

    return NextResponse.json({ success: true, data: results, totalCount });
  } catch (error: any) {
    console.error("API Search Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: "SEARCH_FAILED", 
          message: error.message || "Failed to search comics" 
        } 
      },
      { status: 500 }
    );
  }
}
