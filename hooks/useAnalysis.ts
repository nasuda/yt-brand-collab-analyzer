"use client";

import { useState, useCallback } from "react";
import { AnalysisState, AnalysisResult } from "@/lib/types";

const LOADING_STEPS = [
  "チャンネル情報を取得中...",
  "動画データを収集中...",
  "コメントを分析中...",
  "AIがブランド適合性を評価中...",
];

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    status: "idle",
    result: null,
    error: null,
    loadingStep: "",
  });

  const analyze = useCallback(
    async (channelInput: string, brandName: string, brandDescription?: string) => {
      setState({
        status: "loading",
        result: null,
        error: null,
        loadingStep: LOADING_STEPS[0],
      });

      // Simulate step progression for UX
      let stepIndex = 0;
      const stepInterval = setInterval(() => {
        stepIndex++;
        if (stepIndex < LOADING_STEPS.length) {
          setState((prev) => ({ ...prev, loadingStep: LOADING_STEPS[stepIndex] }));
        }
      }, 3000);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelInput, brandName, brandDescription }),
        });

        clearInterval(stepInterval);

        const data = await res.json();

        if (!res.ok) {
          setState({
            status: "error",
            result: null,
            error: data.error || "分析に失敗しました",
            loadingStep: "",
          });
          return;
        }

        setState({
          status: "success",
          result: data as AnalysisResult,
          error: null,
          loadingStep: "",
        });
      } catch {
        clearInterval(stepInterval);
        setState({
          status: "error",
          result: null,
          error: "ネットワークエラーが発生しました",
          loadingStep: "",
        });
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ status: "idle", result: null, error: null, loadingStep: "" });
  }, []);

  return { ...state, analyze, reset };
}
