import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const { searchParams } = request.nextUrl;
    
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const sortBy = searchParams.get("sortBy") || "like_desc";

    const targetUrl = `https://commento.shngm.io/api/comment?path=chapter%2F${encodeURIComponent(chapterId)}&pageSize=${pageSize}&page=${page}&lang=en&sortBy=${sortBy}`;
    
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
