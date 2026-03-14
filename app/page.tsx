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
import { Button } from "@/components/ui/button";
import { RotateCcw, FileText } from "lucide-react";

export default function Home() {
  const { status, result, comparisonResult, error, loadingStep, mode, analyze, compare, reset } =
    useAnalysis();
  const { exportReport, exporting } = useExportPDF();
  const [showReportModal, setShowReportModal] = useState(false);
  const reportContainerRef = useRef<HTMLDivElement | null>(null);

  const handleGenerateReport = useCallback(
    async (settings: ReportSettings) => {
      if (!result) return;

      const container = document.createElement("div");
      reportContainerRef.current = container;

      const root = createRoot(container);
      try {
        root.render(<PrintableReport result={result} settings={settings} />);

        // 描画完了を待つ: requestAnimationFrame 2回でブラウザの描画サイクルを確実に通す
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        });

        const channelName = result.channel.title || "analysis";
        const brand = result.brandName || "brand";
        await exportReport(container, `${channelName}_x_${brand}_レポート`);

        // 成功時のみモーダルを閉じる
        root.unmount();
        setShowReportModal(false);
      } catch (err) {
        // 失敗時はモーダルを開いたままにしてエラー表示を子に任せる
        root.unmount();
        throw err;
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
                <Button
                  variant="outline"
                  onClick={() => setShowReportModal(true)}
                  disabled={exporting}
                >
                  <FileText className="h-4 w-4" />
                  {exporting ? "レポート生成中..." : "レポート出力"}
                </Button>
              )}
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                新しい分析
              </Button>
            </div>
          )}

          <AnalysisResults
            state={{ status, result, comparisonResult, error, loadingStep, mode }}
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
