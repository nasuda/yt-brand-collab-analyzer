"use client";

import { useAnalysis } from "@/hooks/useAnalysis";
import { useExportPDF } from "@/hooks/useExportPDF";
import { AnalysisForm } from "@/components/AnalysisForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { Button } from "@/components/ui/button";
import { RotateCcw, FileDown } from "lucide-react";

export default function Home() {
  const { status, result, error, loadingStep, analyze, reset } = useAnalysis();
  const { exportPDF, exporting } = useExportPDF();

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
              isLoading={status === "loading"}
            />
          )}

          {status === "success" && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const channelName = result?.channel.title || "analysis";
                  const brand = result?.brandName || "brand";
                  exportPDF("analysis-results", `${channelName}_x_${brand}`);
                }}
                disabled={exporting}
              >
                <FileDown className="h-4 w-4" />
                {exporting ? "PDF生成中..." : "PDF出力"}
              </Button>
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="h-4 w-4" />
                新しい分析
              </Button>
            </div>
          )}

          <AnalysisResults state={{ status, result, error, loadingStep }} />
        </div>
      </div>
    </main>
  );
}
