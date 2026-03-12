import { GoogleGenAI, Type } from "@google/genai";
import { ChannelInfo, VideoInfo, CommentInfo, BrandFitAnalysis } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: {
      type: Type.NUMBER,
      description: "ブランド適合スコア (0-100)",
    },
    contentStyleSummary: {
      type: Type.STRING,
      description: "チャンネルのコンテンツスタイルの要約",
    },
    audienceProfile: {
      type: Type.STRING,
      description: "推定される視聴者層のプロファイル",
    },
    brandAlignmentReasoning: {
      type: Type.STRING,
      description: "ブランドとの適合性の詳細な理由",
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "コラボの強み・メリット",
    },
    risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "コラボのリスク・懸念点",
    },
    collabIdeas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "企画タイトル" },
          format: { type: Type.STRING, description: "動画形式（例: レビュー、チャレンジ、Vlog等）" },
          description: { type: Type.STRING, description: "企画の詳細説明" },
          expectedImpact: { type: Type.STRING, description: "期待される効果・インパクト" },
        },
        required: ["title", "format", "description", "expectedImpact"],
      },
      description: "コラボ企画案（3〜5個）",
    },
  },
  required: [
    "overallScore",
    "contentStyleSummary",
    "audienceProfile",
    "brandAlignmentReasoning",
    "strengths",
    "risks",
    "collabIdeas",
  ],
};

function buildPrompt(
  channel: ChannelInfo,
  videos: VideoInfo[],
  comments: CommentInfo[],
  brandName: string,
  brandDescription?: string
): string {
  const videoSummaries = videos
    .map(
      (v) =>
        `- 「${v.title}」(再生数: ${v.viewCount.toLocaleString()}, いいね: ${v.likeCount.toLocaleString()}, コメント: ${v.commentCount.toLocaleString()}, 投稿日: ${v.publishedAt.slice(0, 10)})\n  タグ: ${v.tags.join(", ") || "なし"}\n  概要: ${v.description.slice(0, 200)}`
    )
    .join("\n\n");

  const commentSummaries = comments
    .slice(0, 50)
    .map((c) => `- [いいね${c.likeCount}] ${c.text}`)
    .join("\n");

  return `あなたはYouTubeマーケティングの専門家です。以下のYouTubeチャンネルデータを分析し、指定されたブランドとのコラボレーション適合性を評価してください。

## チャンネル情報
- チャンネル名: ${channel.title}
- チャンネルURL: ${channel.customUrl}
- 登録者数: ${channel.subscriberCount.toLocaleString()}
- 総再生回数: ${channel.viewCount.toLocaleString()}
- 動画数: ${channel.videoCount.toLocaleString()}
- 開設日: ${channel.publishedAt.slice(0, 10)}
- チャンネル説明: ${channel.description.slice(0, 500)}

## 分析対象動画（最新 + 人気動画）
${videoSummaries}

## 視聴者コメント（代表的なもの）
${commentSummaries}

## コラボ対象ブランド
- ブランド名: ${brandName}
${brandDescription ? `- ブランド説明: ${brandDescription}` : ""}

## 分析タスク
1. チャンネルのコンテンツスタイルと特徴を要約してください
2. 視聴者層のプロファイル（年齢層、興味関心、特徴）を推定してください
3. ブランドとの適合性を0-100点で評価し、その理由を詳しく説明してください
4. コラボの強み（3-5個）とリスク（2-3個）を挙げてください
5. 具体的なコラボ企画案を3〜5個提案してください（タイトル、動画形式、詳細説明、期待効果を含む）

全ての回答は日本語で返してください。`;
}

export async function analyzeBrandFit(
  channel: ChannelInfo,
  videos: VideoInfo[],
  comments: CommentInfo[],
  brandName: string,
  brandDescription?: string
): Promise<BrandFitAnalysis> {
  const prompt = buildPrompt(channel, videos, comments, brandName, brandDescription);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini APIからの応答が空です");
  }

  const raw = JSON.parse(text);

  // ランタイム検証: 必須フィールドの型チェック
  const result: BrandFitAnalysis = {
    overallScore: Math.max(0, Math.min(100, Math.round(Number(raw.overallScore) || 50))),
    contentStyleSummary: typeof raw.contentStyleSummary === "string" ? raw.contentStyleSummary : "分析結果を取得できませんでした",
    audienceProfile: typeof raw.audienceProfile === "string" ? raw.audienceProfile : "不明",
    brandAlignmentReasoning: typeof raw.brandAlignmentReasoning === "string" ? raw.brandAlignmentReasoning : "不明",
    strengths: Array.isArray(raw.strengths) ? raw.strengths.filter((s: unknown) => typeof s === "string") : [],
    risks: Array.isArray(raw.risks) ? raw.risks.filter((s: unknown) => typeof s === "string") : [],
    collabIdeas: Array.isArray(raw.collabIdeas)
      ? raw.collabIdeas
          .filter((idea: unknown) => idea && typeof idea === "object")
          .map((idea: Record<string, unknown>) => ({
            title: typeof idea.title === "string" ? idea.title : "無題",
            format: typeof idea.format === "string" ? idea.format : "不明",
            description: typeof idea.description === "string" ? idea.description : "",
            expectedImpact: typeof idea.expectedImpact === "string" ? idea.expectedImpact : "",
          }))
      : [],
  };

  return result;
}
