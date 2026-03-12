import { NextRequest, NextResponse } from "next/server";
import { validateAnalysisRequest } from "@/lib/validators";
import { resolveChannel, getVideos, getVideoComments } from "@/lib/youtube";
import { analyzeBrandFit, performResearch } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateAnalysisRequest(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { channelInput, brandName, brandDescription, researchMode } = validation.data;

    // Deep Research はクライアント側ポーリングで別途処理するため、ここでは basic/search のみ
    const effectiveMode = researchMode === "deep-research" ? "basic" : researchMode;

    // Step 1: Resolve channel
    const { channel, uploadsPlaylistId } = await resolveChannel(channelInput);

    // Step 2: YouTube data + Creator research（searchモードのみ）を並行実行
    const [videos, creatorResearch] = await Promise.all([
      getVideos(uploadsPlaylistId),
      performResearch(effectiveMode, channel, brandName),
    ]);

    // Step 3: Get comments
    const comments = await getVideoComments(videos.map((v) => v.id));

    // Step 4: Analyze with Gemini
    const analysis = await analyzeBrandFit(
      channel,
      videos,
      comments,
      brandName,
      brandDescription,
      creatorResearch
    );

    return NextResponse.json({
      channel,
      videos,
      analysis,
      brandName,
      researchMode: effectiveMode,
      creatorResearch: creatorResearch || undefined,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "分析中にエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
