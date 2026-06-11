import { NextResponse } from "next/server";

export async function GET() {
  try {
    const GAS_PROXY_URL = "https://komikcast-proxy.heolazzzz.workers.dev/";
    const targetUrl = "https://be.komikcast.cc/genres";
    const isDev = process.env.NODE_ENV === "development";
    const proxyUrl = isDev ? targetUrl : `${GAS_PROXY_URL}?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    const json = await res.json();
    if (!isDev && json.error) throw new Error(json.error);
    
    return NextResponse.json(json);
  } catch (error: any) {
    console.error("Genre fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
