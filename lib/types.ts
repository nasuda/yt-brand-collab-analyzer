export interface AnalysisRequest {
  channelInput: string;
  brandName: string;
  brandDescription?: string;
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

export interface CollabIdea {
  title: string;
  format: string;
  description: string;
  expectedImpact: string;
}

export interface BrandFitAnalysis {
  overallScore: number;
  contentStyleSummary: string;
  audienceProfile: string;
  brandAlignmentReasoning: string;
  strengths: string[];
  risks: string[];
  collabIdeas: CollabIdea[];
}

export interface AnalysisResult {
  channel: ChannelInfo;
  videos: VideoInfo[];
  analysis: BrandFitAnalysis;
  brandName: string;
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export interface AnalysisState {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
  loadingStep: string;
}
