import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://be.komikcast.cc/genres", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!res.ok) {
      throw new Error("Failed to fetch genres");
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (error: any) {
    console.error("Genre fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
