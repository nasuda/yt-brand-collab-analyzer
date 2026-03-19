"use client";

import { AnalysisState, CollabIdea } from "@/lib/types";
import { LoadingState } from "./LoadingState";
import { ChannelOverview } from "./ChannelOverview";
import { EngagementMetrics } from "./EngagementMetrics";
import { CategoryBenchmark } from "./CategoryBenchmark";
import { ResearchSummary } from "./ResearchSummary";
import { BrandFitScore } from "./BrandFitScore";
import { CollabIdeas } from "./CollabIdeas";
import { VideoList } from "./VideoList";
import { ComparisonDashboard } from "./ComparisonDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface AnalysisResultsProps {
  state: AnalysisState;
  onExportIdeaSheet?: (idea: CollabIdea) => void;
  exportingBriefIndex?: number | null;
  isExporting?: boolean;
}

export function AnalysisResults({ state, onExportIdeaSheet, exportingBriefIndex, isExporting }: AnalysisResultsProps) {
  if (state.status === "idle") return null;

  if (state.status === "loading") {
    return <LoadingState step={state.loadingStep} />;
  }

  if (state.status === "error") {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="font-medium">エラーが発生しました</p>
            <p className="text-sm text-muted-foreground">{state.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 比較モード
  if (state.mode === "compare" && state.comparisonResult) {
    return (
      <div id="analysis-results">
        <ComparisonDashboard comparison={state.comparisonResult} />
      </div>
    );
  }

  // 単体モード
  if (!state.result) return null;

  const { channel, videos, analysis, metrics, brandName, creatorResearch, researchMode } = state.result;

  return (
    <div id="analysis-results" className="space-y-6">
      <ChannelOverview channel={channel} />
      {metrics && <EngagementMetrics metrics={metrics} />}
      {analysis.categoryBenchmark && (
        <CategoryBenchmark
          benchmark={analysis.categoryBenchmark}
          persona={analysis.audiencePersona}
          similarCreators={analysis.similarCreators}
        />
      )}
      {creatorResearch && (
        <ResearchSummary creatorResearch={creatorResearch} researchMode={researchMode} />
      )}
      <BrandFitScore analysis={analysis} brandName={brandName} />
      <CollabIdeas
        ideas={analysis.collabIdeas}
        onExportIdeaSheet={onExportIdeaSheet}
        exportingBriefIndex={exportingBriefIndex}
        isExporting={isExporting}
      />
      <VideoList videos={videos} />
    </div>
  );
}
