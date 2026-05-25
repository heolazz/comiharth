import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string; chapterId: string }> }
) {
  try {
    const { provider, chapterId } = await params;
    const providerInstance = getProvider(provider);
    const pages = await providerInstance.getPages(chapterId);

    return NextResponse.json({ success: true, data: pages });
  } catch (error: any) {
    console.error("API Pages Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: "PAGES_FAILED", 
          message: error.message || "Failed to fetch chapter image pages" 
        } 
      },
      { status: 500 }
    );
  }
}
