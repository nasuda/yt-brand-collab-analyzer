import { NextRequest, NextResponse } from "next/server";
import { validateAnalysisRequest } from "@/lib/validators";
import { resolveChannel, getVideos, getVideoComments } from "@/lib/youtube";
import { analyzeBrandFit, performResearch, sanitizeResearch } from "@/lib/gemini";
import { computeMetrics } from "@/lib/metrics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateAnalysisRequest(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { channelInput, brandName, brandDescription, researchMode, creatorResearch: userResearch } = validation.data;

    // Deep Research はクライアント側ポーリングで別途処理するため、ここでは basic/search/custom-research のみ
    const effectiveMode = researchMode === "deep-research" ? "basic" : researchMode;

    // Step 1: Resolve channel
    const { channel, uploadsPlaylistId } = await resolveChannel(channelInput);

    // Step 2: YouTube data + Creator research を並行実行
    // custom-research はユーザー提供テキストを使うため performResearch を呼ばない
    const [videos, autoResearch] = await Promise.all([
      getVideos(uploadsPlaylistId),
      effectiveMode === "custom-research"
        ? Promise.resolve(undefined)
        : performResearch(effectiveMode, channel, brandName),
    ]);

    // custom-research: ユーザー提供テキストをサニタイズして使用
    const finalResearch = effectiveMode === "custom-research" && userResearch
      ? sanitizeResearch(userResearch)
      : autoResearch;

    // Step 3: Get comments
    const comments = await getVideoComments(videos.map((v) => v.id));

    // Step 4: Compute metrics
    const metrics = computeMetrics(channel, videos);

    // Step 5: Analyze with Gemini
    const analysis = await analyzeBrandFit(
      channel,
      videos,
      comments,
      brandName,
      brandDescription,
      finalResearch
    );

    return NextResponse.json({
      channel,
      videos,
      analysis,
      metrics,
      brandName,
      researchMode: effectiveMode,
      creatorResearch: finalResearch || undefined,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "分析中にエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
