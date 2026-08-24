import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    const { chapterId } = await params;
    const { searchParams } = request.nextUrl;
    
    const type = searchParams.get("type") || "chapter"; // "chapter" or "series"
    const provider = searchParams.get("provider") || "shinigami";
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    
    if (provider === "komikcast") {
      // 1. Get numeric series ID from the slug
      let slug = chapterId;
      let chapterNumber = "";
      
      if (type === "chapter" && chapterId.includes("~")) {
        const parts = chapterId.split("~");
        slug = parts[0];
        chapterNumber = parts[1];
      }
      
      const GAS_PROXY_URL = "https://script.google.com/macros/s/AKfycbxcSrY6mQ_hHBvsMk9Qs96BwK5vVImJg6h3zCMGHE3HEBS-g089sMO5wprVHk2bydTPTA/exec";
      const proxyUrl = (url: string) => {
        const isDev = process.env.NODE_ENV === "development";
        return isDev ? url : `${GAS_PROXY_URL}?url=${encodeURIComponent(url)}`;
      };
      
      const seriesRes = await fetch(proxyUrl(`https://api.voratoon.com/series/${slug}?includeMeta=true`), {
        next: { revalidate: 3600 }
      });
      if (!seriesRes.ok) throw new Error("Failed to fetch komikcast series info");
      const seriesJsonRaw = await seriesRes.json();
      const isDev = process.env.NODE_ENV === "development";
      if (!isDev && seriesJsonRaw.error) throw new Error(seriesJsonRaw.error);
      const seriesJson = seriesJsonRaw;
      const seriesNumericId = seriesJson.data?.id || seriesJson.id;
      
      let endpoint = `https://api.voratoon.com/series/${seriesNumericId}/comments?take=${pageSize}&page=${page}`;
      
      // 2. If it's a chapter, we need the numeric chapter ID
      if (type === "chapter" && chapterNumber) {
        const chaptersRes = await fetch(proxyUrl(`https://api.voratoon.com/series/${slug}/chapters`), {
          next: { revalidate: 3600 }
        });
        const chaptersJsonRaw = await chaptersRes.json();
        if (!isDev && chaptersJsonRaw.error) throw new Error(chaptersJsonRaw.error);
        const chaptersJson = chaptersJsonRaw;
        const items = Array.isArray(chaptersJson.data) ? chaptersJson.data : (Array.isArray(chaptersJson) ? chaptersJson : []);
        
        const foundChapter = items.find((c: any) => {
          const cNum = String(c.chapterIndex ?? c.data?.chapterIndex ?? c.data?.number ?? c.data?.index ?? "");
          return cNum === chapterNumber;
        });
        
        if (foundChapter) {
          const chapterNumericId = foundChapter.id;
          endpoint += `&chapterId=${chapterNumericId}`;
        }
      }
      
      console.log(`Proxying komikcast comment request to: ${endpoint}`);
      const commentsRes = await fetch(proxyUrl(endpoint));
      if (!commentsRes.ok) throw new Error(`Komikcast comments error: ${commentsRes.status}`);
      const commentsJsonRaw = await commentsRes.json();
      if (!isDev && commentsJsonRaw.error) throw new Error(commentsJsonRaw.error);
      const commentsJson = commentsJsonRaw;
      const komikcastComments = commentsJson.data || [];
      
      // Map komikcast comments to expected format
      const mappedComments = komikcastComments.map((c: any) => {
        const username = c.data?.user?.metadata?.username || c.data?.user?.fullName || "Anonymous";
        const avatarUrl = c.data?.user?.avatar || "";
        const time = new Date(c.createdAt).getTime();
        
        return {
          status: "approved",
          comment: c.content,
          link: "",
          nick: username,
          pid: null,
          rid: null,
          user_id: c.data?.user?.id || 0,
          sticky: false,
          like: c.data?.votes?.upvotes || 0,
          objectId: c.id,
          level: 0,
          type: c.data?.user?.metadata?.role === "admin" ? "admin" : "user",
          label: null,
          avatar: avatarUrl,
          orig: c.content,
          time: time,
          children: []
        };
      });
      
      return NextResponse.json({
        success: true,
        data: {
          data: {
            count: commentsJson.meta?.total || mappedComments.length, // approximation
            totalPages: commentsJson.meta?.totalPages || (mappedComments.length > 0 ? Number(page) + 1 : Number(page)),
            data: mappedComments
          }
        }
      });
    }

    // Shinigami logic
    const prefix = type === "series" ? "series%2F" : "chapter%2F";
    const sortBy = searchParams.get("sortBy") || "like_desc";

    const realId = (type === "chapter" && chapterId.includes("~"))
      ? chapterId.split("~")[1] 
      : (type === "chapter" && chapterId.includes("-chapter-"))
        ? chapterId.split("-chapter-")[1] 
        : chapterId;

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
