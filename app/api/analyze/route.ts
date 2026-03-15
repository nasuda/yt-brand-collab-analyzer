import { NextRequest, NextResponse } from "next/server";
import { validateAnalysisRequest } from "@/lib/validators";
import { resolveChannel, getVideos, getVideoComments } from "@/lib/youtube";
import {
  analyzeBrandFit, performResearch, sanitizeResearch,
  analyzeComments, analyzeContentPatterns, generateIdeaSketches,
  DEFAULT_MODEL_CONFIG,
} from "@/lib/gemini";
import { computeMetrics } from "@/lib/metrics";
import type { ModelConfig } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateAnalysisRequest(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { channelInput, brandName, brandDescription, researchMode, creatorResearch: userResearch } = validation.data;
    const modelConfig: ModelConfig = body.modelConfig || DEFAULT_MODEL_CONFIG;

    // Deep Research はクライアント側ポーリングで別途処理するため、ここでは basic/search/custom-research のみ
    const effectiveMode = researchMode === "deep-research" ? "basic" : researchMode;

    // Step 1: Resolve channel
    const { channel, uploadsPlaylistId } = await resolveChannel(channelInput);

    // Step 2: YouTube data + Creator research を並行実行
    // custom-research はユーザー提供テキストを使うため performResearch を呼ばない
    const [videosResult, autoResearch] = await Promise.all([
      getVideos(uploadsPlaylistId),
      effectiveMode === "custom-research"
        ? Promise.resolve(undefined)
        : performResearch(effectiveMode, channel, brandName, modelConfig.researchModel),
    ]);

    const { videos, latestVideos } = videosResult;

    // custom-research: ユーザー提供テキストをサニタイズして使用
    const finalResearch = effectiveMode === "custom-research" && userResearch
      ? sanitizeResearch(userResearch)
      : autoResearch;

    // Step 3: Get comments
    const comments = await getVideoComments(videos.map((v) => v.id));

    // Step 4: Compute metrics（時系列指標にはlatestVideosのみ使用）
    const metrics = computeMetrics(channel, videos, latestVideos);

    // Step 5: Pre-analysis（コメント分析 + コンテンツパターン分析を並列実行）
    const [commentAnalysis, contentPatterns] = await Promise.all([
      analyzeComments(comments, modelConfig.helperModel),
      analyzeContentPatterns(videos, modelConfig.helperModel),
    ]);

    // Step 6: Idea sketches
    const ideaSketches = await generateIdeaSketches(
      channel, videos, brandName, brandDescription,
      commentAnalysis, contentPatterns,
      modelConfig.helperModel,
    );

    // Step 7: Analyze with Gemini
    const analysis = await analyzeBrandFit(
      channel,
      videos,
      comments,
      brandName,
      brandDescription,
      finalResearch,
      modelConfig.analysisModel,
      metrics,
      commentAnalysis,
      contentPatterns,
      ideaSketches,
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
