import { NextRequest, NextResponse } from "next/server";
import { resolveChannel, getVideos, getVideoComments } from "@/lib/youtube";
import { analyzeBrandFit, performResearch } from "@/lib/gemini";
import { computeMetrics } from "@/lib/metrics";
import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, ResearchMode } from "@/lib/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const MAX_CHANNELS = 5;

interface CompareRequest {
  channels: string[];
  brandName: string;
  brandDescription?: string;
  researchMode: ResearchMode;
}

async function analyzeOneChannel(
  channelInput: string,
  brandName: string,
  brandDescription: string | undefined,
  researchMode: ResearchMode
): Promise<AnalysisResult> {
  const effectiveMode = researchMode === "deep-research" ? "basic" : researchMode;

  const { channel, uploadsPlaylistId } = await resolveChannel(channelInput);

  const [videosResult, autoResearch] = await Promise.all([
    getVideos(uploadsPlaylistId),
    effectiveMode === "custom-research"
      ? Promise.resolve(undefined)
      : performResearch(effectiveMode, channel, brandName),
  ]);

  const { videos, latestVideos } = videosResult;
  const finalResearch = autoResearch;
  const metrics = computeMetrics(channel, videos, latestVideos);
  const comments = await getVideoComments(videos.map((v) => v.id));

  const analysis = await analyzeBrandFit(
    channel,
    videos,
    comments,
    brandName,
    brandDescription,
    finalResearch
  );

  return {
    channel,
    videos,
    analysis,
    metrics,
    brandName,
    researchMode: effectiveMode,
    creatorResearch: finalResearch || undefined,
  };
}

async function generateComparisonSummary(
  results: AnalysisResult[],
  brandName: string
): Promise<string> {
  const summaries = results
    .map(
      (r, i) =>
        `${i + 1}. ${r.channel.title}（スコア: ${r.analysis.overallScore}/100, 登録者: ${r.channel.subscriberCount.toLocaleString()}, エンゲージメント率: ${r.metrics.engagementRate}%, カテゴリ: ${r.analysis.categoryBenchmark?.channelCategory || "不明"}）`
    )
    .join("\n");

  const prompt = `以下の${results.length}チャンネルのブランド「${brandName}」とのコラボ適合性を比較し、ランキング理由と各チャンネルの特徴を簡潔にまとめてください（日本語、500文字以内）。

${summaries}

広告主がどのチャンネルを選ぶべきかの判断材料として、各チャンネルの強み・弱みの比較と推奨順位を述べてください。`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
  });

  return response.text || "比較サマリーを生成できませんでした";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CompareRequest;

    if (
      !Array.isArray(body.channels) ||
      body.channels.length < 2 ||
      body.channels.length > MAX_CHANNELS
    ) {
      return NextResponse.json(
        { error: `チャンネルは2〜${MAX_CHANNELS}個指定してください` },
        { status: 400 }
      );
    }

    if (!body.brandName?.trim()) {
      return NextResponse.json(
        { error: "ブランド名を入力してください" },
        { status: 400 }
      );
    }

    // researchModeバリデーション（比較モードではbasic/searchのみ許可）
    const allowedModes: ResearchMode[] = ["basic", "search"];
    const researchMode = allowedModes.includes(body.researchMode)
      ? body.researchMode
      : "basic";

    const results: AnalysisResult[] = [];
    const errors: { channel: string; error: string }[] = [];
    const seenChannelIds = new Set<string>();

    // 順次分析（Geminiレート制限考慮）
    for (const channelInput of body.channels) {
      try {
        const result = await analyzeOneChannel(
          channelInput.trim(),
          body.brandName.trim(),
          body.brandDescription?.trim(),
          researchMode
        );

        // resolve後のchannel IDで重複排除
        if (seenChannelIds.has(result.channel.id)) {
          errors.push({
            channel: channelInput,
            error: `「${result.channel.title}」は既に分析済みです（重複チャンネル）`,
          });
          continue;
        }
        seenChannelIds.add(result.channel.id);

        results.push(result);
      } catch (err) {
        errors.push({
          channel: channelInput,
          error: err instanceof Error ? err.message : "分析に失敗しました",
        });
      }
    }

    // 比較には最低2件必要
    if (results.length < 2) {
      return NextResponse.json(
        {
          error: results.length === 0
            ? "全てのチャンネルの分析に失敗しました"
            : "比較には2チャンネル以上の分析成功が必要です",
          errors,
        },
        { status: 500 }
      );
    }

    // 比較サマリー生成
    const comparisonSummary =
      results.length >= 2
        ? await generateComparisonSummary(results, body.brandName.trim())
        : "";

    return NextResponse.json({
      results,
      comparisonSummary,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Compare error:", error);
    const message =
      error instanceof Error ? error.message : "比較分析中にエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
