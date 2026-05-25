import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string; id: string }> }
) {
  try {
    const { provider, id } = await params;
    const providerInstance = getProvider(provider);
    const details = await providerInstance.getDetails(id);

    return NextResponse.json({ success: true, data: details });
  } catch (error: any) {
    console.error("API Detail Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: "DETAIL_FAILED", 
          message: error.message || "Comic details not found or source unavailable" 
        } 
      },
      { status: 500 }
    );
  }
}
