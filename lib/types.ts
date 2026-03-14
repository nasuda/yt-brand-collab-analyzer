export type ResearchMode = "basic" | "search" | "deep-research" | "custom-research";

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
  contentDirection: string;        // コンテンツの方向性・トーン・スタイル指示
  descriptionBoxSuggestion: string; // 概要欄の推奨内容
  keyMessages: string[];           // 伝えるべきキーメッセージ（3〜5個）
  toneAndManner: string;           // トーン&マナー・NG表現等
}

export interface DistributionStrategy {
  adProduct: string;               // 推奨Google広告プロダクト
  mixStrategy: string;             // 単独 or ブランド広告とのミックス方針
  audienceTargeting: string;       // ターゲティング推奨
  budgetAllocation: string;        // 予算配分の方向性
}

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
