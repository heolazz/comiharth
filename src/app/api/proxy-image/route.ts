import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const referer = request.nextUrl.searchParams.get("referer");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const headers = new Headers();
    if (referer) headers.set("Referer", referer);
    // Masquerade as a real browser to bypass hotlink protection/Cloudflare blocks
    headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    headers.set("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8");
    headers.set("Accept-Language", "en-US,en;q=0.9");

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error: any) {
    console.error("Image proxy error:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}
