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
      const GAS_PROXY_URL = "https://komikcast-proxy.heolazzzz.workers.dev/";
      const targetUrl = "https://be.komikcast.cc/genres";
      const isDev = process.env.NODE_ENV === "development";
      const proxyUrl = isDev ? targetUrl : `${GAS_PROXY_URL}?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl, {
        next: { revalidate: 3600 }
      });
      const json = await res.json();
      if (!isDev && json.error) throw new Error(json.error);
      
      const genres = json.data || json;
      return NextResponse.json(genres);
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
