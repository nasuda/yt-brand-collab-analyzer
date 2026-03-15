import { NextRequest, NextResponse } from "next/server";
import { validateAnalysisRequest } from "@/lib/validators";
import { resolveChannel, getVideos, getVideoComments } from "@/lib/youtube";
import { computeMetrics } from "@/lib/metrics";
import {
  startDeepResearch, pollDeepResearch, performResearch,
  analyzeBrandFit, sanitizeResearch,
  analyzeComments, analyzeContentPatterns, generateIdeaSketches,
} from "@/lib/gemini";
import { validateModelConfig } from "@/lib/types";

// POST: Deep Research を開始し、interactionId + YouTube データを返す
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body as { action?: string };
    const modelConfig = validateModelConfig(body.modelConfig);

    if (action === "poll") {
      // --- ポーリング: interactionId の状態を確認 ---
      const { interactionId } = body as { interactionId: string };
      if (!interactionId) {
        return NextResponse.json({ error: "interactionId is required" }, { status: 400 });
      }

      const result = await pollDeepResearch(interactionId);
      return NextResponse.json(result);
    }

    if (action === "analyze") {
      // --- 最終分析: リサーチ結果 + YouTubeデータで分析実行 ---
      const { channelInput, brandName, brandDescription, creatorResearch } = body;

      const validation = validateAnalysisRequest(body);
      if (!validation.valid || !validation.data) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // クライアントから送られる creatorResearch は非信頼データなのでサニタイズ必須
      const sanitizedResearch = typeof creatorResearch === "string"
        ? sanitizeResearch(creatorResearch)
        : undefined;

      const { channel, uploadsPlaylistId } = await resolveChannel(channelInput);
      const { videos, latestVideos } = await getVideos(uploadsPlaylistId);
      const comments = await getVideoComments(videos.map((v) => v.id));
      const metrics = computeMetrics(channel, videos, latestVideos);

      // Pre-analysis
      const [commentAnalysis, contentPatterns] = await Promise.all([
        analyzeComments(comments, modelConfig.helperModel),
        analyzeContentPatterns(videos, modelConfig.helperModel),
      ]);

      const ideaSketches = await generateIdeaSketches(
        channel, videos, brandName, brandDescription,
        commentAnalysis, contentPatterns,
        modelConfig.helperModel,
      );

      const analysis = await analyzeBrandFit(
        channel,
        videos,
        comments,
        brandName,
        brandDescription,
        sanitizedResearch,
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
        researchMode: "deep-research",
        creatorResearch: sanitizedResearch,
      });
    }

    // --- デフォルト: Deep Research を開始 ---
    const validation = validateAnalysisRequest(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { channelInput, brandName } = validation.data;
    const { channel } = await resolveChannel(channelInput);

    const interactionId = await startDeepResearch(channel, brandName);

    if (!interactionId) {
      // Deep Research API 非対応 → Google Search にフォールバック
      const fallbackResearch = await performResearch("search", channel, brandName, modelConfig.researchModel);
      return NextResponse.json({
        fallback: true,
        creatorResearch: fallbackResearch,
      });
    }

    return NextResponse.json({ interactionId, channelTitle: channel.title });
  } catch (error) {
    console.error("Deep Research error:", error);
    const message = error instanceof Error ? error.message : "Deep Research でエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
