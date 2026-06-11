import { NextResponse } from "next/server";

export async function GET() {
  try {
    const GAS_PROXY_URL = "https://script.google.com/macros/s/AKfycbxcSrY6mQ_hHBvsMk9Qs96BwK5vVImJg6h3zCMGHE3HEBS-g089sMO5wprVHk2bydTPTA/exec";
    const proxyUrl = `${GAS_PROXY_URL}?url=${encodeURIComponent("https://be.komikcast.cc/genres")}`;
    const res = await fetch(proxyUrl, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    const json = await res.json();
    if (json.error) throw new Error(json.error);
    
    return NextResponse.json(json);
  } catch (error: any) {
    console.error("Genre fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
