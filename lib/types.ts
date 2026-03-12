export type ResearchMode = "basic" | "search" | "deep-research";

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

export interface CollabIdea {
  title: string;
  format: string;
  description: string;
  expectedImpact: string;
  basedOn: string;
  feasibility: "低" | "中" | "高";
  targetKPI: string;
  brandSafetyNote: string;
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
}

export interface AnalysisResult {
  channel: ChannelInfo;
  videos: VideoInfo[];
  analysis: BrandFitAnalysis;
  brandName: string;
  researchMode: ResearchMode;
  creatorResearch?: string;
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export interface AnalysisState {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
  loadingStep: string;
}
