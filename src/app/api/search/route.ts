import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const providerName = searchParams.get("provider") || "shinigami";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const format = searchParams.get("format") || "";

    if (!query) {
      return NextResponse.json({ success: true, data: [] });
    }

    const provider = getProvider(providerName);
    const results = await provider.search(query, page, format);

    return NextResponse.json({ success: true, data: results });
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
