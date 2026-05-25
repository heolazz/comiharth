import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string; id: string }> }
) {
  try {
    const { provider, id } = await params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") || "en";

    const providerInstance = getProvider(provider);
    const chapters = await providerInstance.getChapters(id, { language });

    return NextResponse.json({ success: true, data: chapters });
  } catch (error: any) {
    console.error("API Chapters Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: "CHAPTERS_FAILED", 
          message: error.message || "Failed to fetch chapters list" 
        } 
      },
      { status: 500 }
    );
  }
}
