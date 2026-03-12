"use client";

import { AnalysisState } from "@/lib/types";
import { LoadingState } from "./LoadingState";
import { ChannelOverview } from "./ChannelOverview";
import { BrandFitScore } from "./BrandFitScore";
import { CollabIdeas } from "./CollabIdeas";
import { VideoList } from "./VideoList";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface AnalysisResultsProps {
  state: AnalysisState;
}

export function AnalysisResults({ state }: AnalysisResultsProps) {
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

  if (!state.result) return null;

  const { channel, videos, analysis, brandName } = state.result;

  return (
    <div id="analysis-results" className="space-y-6">
      <ChannelOverview channel={channel} />
      <BrandFitScore analysis={analysis} brandName={brandName} />
      <CollabIdeas ideas={analysis.collabIdeas} />
      <VideoList videos={videos} />
    </div>
  );
}
