import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const { searchParams } = request.nextUrl;
    
    const type = searchParams.get("type") || "chapter"; // "chapter" or "series"
    const prefix = type === "series" ? "series%2F" : "chapter%2F";
    
    // Extract the real ID if it contains a provider delimiter (e.g. comicId~realChapterId)
    // Only apply this parsing for chapters, series ID is usually pristine
    const realId = (type === "chapter" && chapterId.includes("~"))
      ? chapterId.split("~")[1] 
      : (type === "chapter" && chapterId.includes("-chapter-"))
        ? chapterId.split("-chapter-")[1] 
        : chapterId;

    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const sortBy = searchParams.get("sortBy") || "like_desc";

    const targetUrl = `https://commento.shngm.io/api/comment?path=${prefix}${encodeURIComponent(realId)}&pageSize=${pageSize}&page=${page}&lang=en&sortBy=${sortBy}`;
    
    console.log(`Proxying comment request to: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Comments Proxy Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: "COMMENTS_FAILED", 
          message: error.message || "Failed to fetch comments from server" 
        } 
      },
      { status: 500 }
    );
  }
}
