"use client";

import { useRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useExportPDF } from "@/hooks/useExportPDF";
import { AnalysisForm } from "@/components/AnalysisForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { ReportSettingsModal } from "@/components/ReportSettingsModal";
import { PrintableReport } from "@/components/PrintableReport";
import type { ReportSettings } from "@/components/PrintableReport";
import { CreatorBriefReport } from "@/components/CreatorBriefReport";
import { IdeaSheetReport } from "@/components/IdeaSheetReport";
import { CollabIdea } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, FileText, FileDown, AlertTriangle } from "lucide-react";

export default function Home() {
  const { status, result, comparisonResult, error, loadingStep, mode, analyze, compare, reset } =
    useAnalysis();
  const { exportReport, exporting } = useExportPDF();
  const [showReportModal, setShowReportModal] = useState(false);
  const [exportingBrief, setExportingBrief] = useState(false);
  const [exportingBriefIndex, setExportingBriefIndex] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const reportContainerRef = useRef<HTMLDivElement | null>(null);

  const isAnyExporting = exporting || exportingBrief || exportingBriefIndex !== null;

  const handleGenerateReport = useCallback(
    async (settings: ReportSettings) => {
      if (!result) return;

      const container = document.createElement("div");
      reportContainerRef.current = container;

      const root = createRoot(container);
      try {
        root.render(<PrintableReport result={result} settings={settings} />);

        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        });

        const channelName = result.channel.title || "analysis";
        const brand = result.brandName || "brand";
        await exportReport(container, `${channelName}_x_${brand}_レポート`);

        root.unmount();
        setShowReportModal(false);
      } catch (err) {
        root.unmount();
        throw err;
      }
    },
    [result, exportReport]
  );

  // メインブリーフ出力（施策概要 + 投稿指示書、企画案なし）
  const handleExportMainBrief = useCallback(
    async () => {
      if (!result) return;
      setExportingBrief(true);
      setExportError(null);

      const container = document.createElement("div");
      const root = createRoot(container);
      try {
        root.render(
          <CreatorBriefReport
            brandName={result.brandName}
            channelName={result.channel.title}
            campaignOverview={result.analysis.campaignOverview}
            campaignRules={result.analysis.campaignRules}
            brandAlignmentReasoning={result.analysis.brandAlignmentReasoning}
          />
        );

        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        });

        const channelName = result.channel.title || "creator";
        await exportReport(container, `${channelName}_x_${result.brandName}_ブリーフ`);
        root.unmount();
      } catch {
        root.unmount();
        setExportError("ブリーフの生成に失敗しました。もう一度お試しください。");
      } finally {
        setExportingBrief(false);
      }
    },
    [result, exportReport]
  );

  // 企画シート出力（個別の企画案、別紙）
  const handleExportIdeaSheet = useCallback(
    async (idea: CollabIdea) => {
      if (!result) return;

      const ideaIndex = result.analysis.collabIdeas.indexOf(idea);
      setExportingBriefIndex(ideaIndex >= 0 ? ideaIndex : 0);
      setExportError(null);

      const container = document.createElement("div");
      const root = createRoot(container);
      try {
        root.render(
          <IdeaSheetReport
            brandName={result.brandName}
            channelName={result.channel.title}
            idea={idea}
          />
        );

        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        });

        const channelName = result.channel.title || "creator";
        const safeTitle = idea.title.replace(/[/\\?%*:|"<>]/g, "_").slice(0, 30);
        await exportReport(container, `${channelName}_企画シート_${safeTitle}`);
        root.unmount();
      } catch {
        root.unmount();
        setExportError("企画シートの生成に失敗しました。もう一度お試しください。");
      } finally {
        setExportingBriefIndex(null);
      }
    },
    [result, exportReport]
  );

  const canExportReport = status === "success" && mode === "single" && result;

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            YouTube Creator x Brand
          </h1>
          <p className="text-muted-foreground mt-2">
            コラボ適合性分析 & 企画案ジェネレーター
          </p>
        </header>

        <div className="space-y-6">
          {status !== "success" && (
            <AnalysisForm
              onSubmit={analyze}
              onCompare={compare}
              isLoading={status === "loading"}
            />
          )}

          {status === "success" && (
            <div className="flex justify-end gap-2">
              {canExportReport && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleExportMainBrief}
                    disabled={isAnyExporting}
                  >
                    <FileDown className="h-4 w-4" />
                    {exportingBrief ? "ブリーフ生成中..." : "クリエイターブリーフ"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReportModal(true)}
                    disabled={isAnyExporting}
                  >
                    <FileText className="h-4 w-4" />
                    {exporting ? "レポート生成中..." : "レポート出力"}
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                新しい分析
              </Button>
            </div>
          )}

          {exportError && (
            <Card className="border-destructive">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{exportError}</p>
              </CardContent>
            </Card>
          )}

          <AnalysisResults
            state={{ status, result, comparisonResult, error, loadingStep, mode }}
            onExportIdeaSheet={handleExportIdeaSheet}
            exportingBriefIndex={exportingBriefIndex}
            isExporting={isAnyExporting}
          />
        </div>
      </div>

      <ReportSettingsModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        onGenerate={handleGenerateReport}
        generating={exporting}
      />
    </main>
  );
}
