export type ResearchMode = "basic" | "search" | "deep-research" | "custom-research";

export interface ModelConfig {
  analysisModel: string;
  researchModel: string;
  helperModel: string;
}

export const AVAILABLE_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "高速・低コスト" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "高性能・バランス" },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", description: "最新・最高品質" },
] as const;

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  analysisModel: "gemini-2.5-flash",
  researchModel: "gemini-2.5-flash",
  helperModel: "gemini-2.5-flash",
};

const ALLOWED_MODEL_IDS: Set<string> = new Set(AVAILABLE_MODELS.map((m) => m.id));

/** リクエストの modelConfig を検証し、不足フィールドをデフォルトで埋め、不正なモデルIDを弾く */
export function validateModelConfig(input: unknown): ModelConfig {
  if (!input || typeof input !== "object") return { ...DEFAULT_MODEL_CONFIG };

  const raw = input as Record<string, unknown>;
  const merged: ModelConfig = {
    analysisModel: typeof raw.analysisModel === "string" && ALLOWED_MODEL_IDS.has(raw.analysisModel)
      ? raw.analysisModel : DEFAULT_MODEL_CONFIG.analysisModel,
    researchModel: typeof raw.researchModel === "string" && ALLOWED_MODEL_IDS.has(raw.researchModel)
      ? raw.researchModel : DEFAULT_MODEL_CONFIG.researchModel,
    helperModel: typeof raw.helperModel === "string" && ALLOWED_MODEL_IDS.has(raw.helperModel)
      ? raw.helperModel : DEFAULT_MODEL_CONFIG.helperModel,
  };
  return merged;
}

export interface AnalysisRequest {
  channelInput: string;
  brandName: string;
  brandDescription?: string;
  researchMode: ResearchMode;
}

export interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
}

export interface CommentInfo {
  videoId: string;
  text: string;
  likeCount: number;
  publishedAt: string;
}

export interface ScoreBreakdown {
  contentAffinity: number;
  contentAffinityReason: string;
  audienceMatch: number;
  audienceMatchReason: string;
  engagementQuality: number;
  engagementQualityReason: string;
  brandSafety: number;
  brandSafetyReason: string;
  feasibility: number;
  feasibilityReason: string;
}

export interface RiskSource {
  title: string;
  url?: string;
}

export interface RiskItem {
  description: string;
  sources: RiskSource[];
}

export interface BrandSafety {
  safetyScore: number;
  concerns: RiskItem[];
  recommendation: "推奨" | "条件付き推奨" | "非推奨";
}

export interface PostingInstruction {
  contentDirection: string;         // 構成フレームワーク（固定/自由ゾーンを明示した構成ガイド）
  descriptionBoxSuggestion: string; // 概要欄テンプレート
  keyMessages: string[];            // キーメッセージ（3〜5個）
  toneAndManner: string;            // トーン&マナー
  brandMustDo: string[];            // ブランド必須要件（法的義務・訴求必須ポイント、3-5個）
  brandMustNot: string[];           // NG行為・表現（絶対やってはいけないこと、2-4個）
  creatorFreedom: string[];         // クリエイターの自由裁量領域（3-5個）
  creatorContext: string;           // この企画がこのクリエイターに合う理由（動画・コメント分析に基づく根拠）
  sampleOpening: string;            // クリエイターの話し方で書いた導入例（30-50字）
}

export interface DistributionStrategy {
  adProduct: string;               // 推奨Google広告プロダクト
  mixStrategy: string;             // 単独 or ブランド広告とのミックス方針
  audienceTargeting: string;       // ターゲティング推奨
  budgetAllocation: string;        // 予算配分の方向性
}

export type FunnelStage = "認知" | "検討" | "獲得";
export type RiskLevel = "安全策" | "標準" | "挑戦的";
export type CampaignType = "単発" | "シリーズ" | "キャンペーン";

export interface CollabIdea {
  title: string;
  format: string;
  description: string;
  expectedImpact: string;
  basedOn: string;
  feasibility: "低" | "中" | "高";
  targetKPI: string;
  brandSafetyNote: string;
  postingInstruction: PostingInstruction;
  distributionStrategy: DistributionStrategy;
  funnelStage: FunnelStage;
  riskLevel: RiskLevel;
  campaignType: CampaignType;
  creatorPattern: string;
  viewerHook: string;
}

export interface CategoryBenchmark {
  channelCategory: string;
  categoryTier: string;
  engagementComparison: string;
  viewEfficiencyComparison: string;
}

export interface AudiencePersona {
  estimatedAgeRange: string;
  estimatedGenderSplit: string;
  estimatedInterests: string[];
  estimatedRegion: string;
  summary: string;
}

export interface SimilarCreator {
  name: string;
  handle: string;
  reason: string;
}

export interface CampaignOverview {
  objective: string;       // 施策の目的（何を達成したいか）
  challenge: string;       // 課題感・背景（なぜこの施策が必要か）
  insight: string;         // ターゲットインサイト（ターゲットの心理・行動の核心）
  targetAudience: string;  // ターゲット像（誰に届けたいか）
}

export interface BrandFitAnalysis {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  contentStyleSummary: string;
  audienceProfile: string;
  brandAlignmentReasoning: string;
  brandSafety: BrandSafety;
  strengths: string[];
  risks: RiskItem[];
  collabIdeas: CollabIdea[];
  categoryBenchmark: CategoryBenchmark;
  audiencePersona: AudiencePersona;
  similarCreators: SimilarCreator[];
  campaignOverview?: CampaignOverview;
}

export interface ChannelMetrics {
  engagementRate: number;
  avgViews: number;
  viewsPerSubscriber: number;
  likeRate: number;
  commentRate: number;
  postingFrequency: string;
  viewTrend: "上昇" | "安定" | "下降";
  topTags: string[];
}

export interface AnalysisResult {
  channel: ChannelInfo;
  videos: VideoInfo[];
  analysis: BrandFitAnalysis;
  metrics: ChannelMetrics;
  brandName: string;
  researchMode: ResearchMode;
  creatorResearch?: string;
}

export interface ComparisonError {
  channel: string;
  error: string;
}

export interface ComparisonResult {
  results: AnalysisResult[];
  comparisonSummary: string;
  errors?: ComparisonError[];
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export interface AnalysisState {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  comparisonResult: ComparisonResult | null;
  error: string | null;
  loadingStep: string;
  mode: "single" | "compare";
}

// Phase B types
export interface CommentAnalysis {
  topTopics: string[];
  sentimentSummary: string;
  engagementDrivers: string[];
  frequentRequests: string[];
}

export interface ContentPatternType {
  type: string;
  examples: string[];
  frequency: string;
}

export interface ContentPatternAnalysis {
  contentTypes: ContentPatternType[];
  bestPerformingType: string;
  signatureElements: string[];
  collaborationHistory: string;
}

export interface IdeaSketch {
  title: string;
  format: string;
  funnelStage: string;
  oneLiner: string;
  basedOn: string;
}
