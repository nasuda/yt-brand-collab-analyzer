"use client";

import { useState, useCallback, useRef } from "react";
import { AnalysisState, AnalysisResult, ComparisonResult, ComparisonError, ResearchMode, ModelConfig } from "@/lib/types";

const LOADING_STEPS: Record<ResearchMode, string[]> = {
  basic: [
    "チャンネル情報を取得中...",
    "動画データを収集中...",
    "コメントを分析中...",
    "コンテンツパターンを解析中...",
    "アイデアスケッチを生成中...",
    "AIがブランド適合性を評価中...",
  ],
  search: [
    "チャンネル情報を取得中...",
    "動画データを収集中...",
    "Google検索でクリエイター情報を調査中...",
    "コメントを分析中...",
    "コンテンツパターンを解析中...",
    "アイデアスケッチを生成中...",
    "AIがブランド適合性を評価中...",
  ],
  "deep-research": [
    "Deep Researchを開始中...",
    "AIがクリエイターを徹底調査中...",
  ],
  "custom-research": [
    "チャンネル情報を取得中...",
    "動画データを収集中...",
    "コメントを分析中...",
    "コンテンツパターンを解析中...",
    "アイデアスケッチを生成中...",
    "添付レポートをもとにAIが分析中...",
  ],
};

const POLL_INTERVAL = 10_000; // 10秒ごとにポーリング
const POLL_TIMEOUT = 25 * 60 * 1000; // 25分タイムアウト

async function postJSON(url: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

const INITIAL_STATE: AnalysisState = {
  status: "idle",
  result: null,
  comparisonResult: null,
  error: null,
  loadingStep: "",
  mode: "single",
};

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(INITIAL_STATE);
  const abortRef = useRef(false);

  const isAborted = () => abortRef.current;

  const setError = (error: string) => {
    if (isAborted()) return;
    setState((prev) => ({ ...prev, status: "error", result: null, comparisonResult: null, error, loadingStep: "" }));
  };

  const setSuccess = (result: AnalysisResult) => {
    if (isAborted()) return;
    setState((prev) => ({ ...prev, status: "success", result, error: null, loadingStep: "" }));
  };

  const setComparisonSuccess = (comparisonResult: ComparisonResult) => {
    if (isAborted()) return;
    setState((prev) => ({ ...prev, status: "success", comparisonResult, error: null, loadingStep: "" }));
  };

  /** basic / search / custom-research モードの分析 */
  const analyzeStandard = async (
    channelInput: string,
    brandName: string,
    brandDescription: string | undefined,
    researchMode: ResearchMode,
    creatorResearch?: string,
    modelConfig?: ModelConfig,
  ) => {
    const steps = LOADING_STEPS[researchMode];
    let stepIndex = 0;
    const stepTimer = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setState((prev) => ({ ...prev, loadingStep: steps[stepIndex] }));
      }
    }, 3000);

    try {
      const { ok, data } = await postJSON("/api/analyze", {
        channelInput, brandName, brandDescription, researchMode, creatorResearch, modelConfig,
      });
      clearInterval(stepTimer);

      if (!ok) {
        setError((data.error as string) || "分析に失敗しました");
        return;
      }
      setSuccess(data as unknown as AnalysisResult);
    } catch {
      clearInterval(stepTimer);
      setError("ネットワークエラーが発生しました");
    }
  };

  /** deep-research モードの分析（クライアント側ポーリング） */
  const analyzeDeepResearch = async (
    channelInput: string,
    brandName: string,
    brandDescription: string | undefined,
    modelConfig?: ModelConfig,
  ) => {
    // Step 1: Deep Research を開始
    setState((prev) => ({ ...prev, loadingStep: "Deep Researchを開始中..." }));

    const { ok: startOk, data: startData } = await postJSON("/api/deep-research", {
      channelInput, brandName, brandDescription, modelConfig,
    });

    if (!startOk) {
      setError((startData.error as string) || "Deep Researchの開始に失敗しました");
      return;
    }

    // フォールバック: Deep Research API非対応 → そのまま結果を使って分析
    if (startData.fallback) {
      if (isAborted()) return;
      setState((prev) => ({ ...prev, loadingStep: "Google検索で調査中（フォールバック）..." }));
      const { ok, data } = await postJSON("/api/deep-research", {
        action: "analyze",
        channelInput, brandName, brandDescription,
        creatorResearch: startData.creatorResearch,
        modelConfig,
      });
      if (!ok) {
        setError((data.error as string) || "分析に失敗しました");
        return;
      }
      setSuccess(data as unknown as AnalysisResult);
      return;
    }

    const interactionId = startData.interactionId as string;
    const channelTitle = startData.channelTitle as string;

    // Step 2: ポーリング
    setState((prev) => ({
      ...prev,
      loadingStep: `「${channelTitle}」をDeep Researchで調査中...`,
    }));

    const startTime = Date.now();
    let creatorResearch: string | undefined;

    while (!abortRef.current) {
      if (Date.now() - startTime > POLL_TIMEOUT) {
        setError("Deep Researchがタイムアウトしました（25分）。Web検索モードでお試しください。");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      if (abortRef.current) return;

      const { ok: pollOk, data: pollData } = await postJSON("/api/deep-research", {
        action: "poll",
        interactionId,
      });

      if (!pollOk) {
        setError((pollData.error as string) || "ポーリング中にエラーが発生しました");
        return;
      }

      const status = pollData.status as string;

      if (status === "completed") {
        creatorResearch = pollData.text as string;
        break;
      }

      if (status === "failed") {
        setError("Deep Researchが失敗しました。Web検索モードでお試しください。");
        return;
      }

      // まだ進行中 → ステップ表示を更新
      const elapsed = Math.floor((Date.now() - startTime) / 60000);
      setState((prev) => ({
        ...prev,
        loadingStep: `「${channelTitle}」をDeep Researchで調査中...（${elapsed}分経過）`,
      }));
    }

    if (abortRef.current) return;

    if (isAborted()) return;

    // Step 3: 調査結果をもとに最終分析
    setState((prev) => ({ ...prev, loadingStep: "調査結果をもとにブランド適合性を分析中..." }));

    const { ok: analyzeOk, data: analyzeData } = await postJSON("/api/deep-research", {
      action: "analyze",
      channelInput, brandName, brandDescription,
      creatorResearch,
      modelConfig,
    });

    if (!analyzeOk) {
      setError((analyzeData.error as string) || "最終分析に失敗しました");
      return;
    }

    setSuccess(analyzeData as unknown as AnalysisResult);
  };

  /** 複数チャンネル比較モード */
  const analyzeCompare = async (
    channels: string[],
    brandName: string,
    brandDescription?: string,
    researchMode: ResearchMode = "basic",
    modelConfig?: ModelConfig,
  ) => {
    const total = channels.length;

    // 進捗表示用タイマー
    const progressTimer = setInterval(() => {
      setState((prev) => ({
        ...prev,
        loadingStep: `${total}チャンネルを分析中...`,
      }));
    }, 5000);

    try {
      setState((prev) => ({
        ...prev,
        loadingStep: `チャンネル 1/${total} を分析中...`,
      }));

      const { ok, data } = await postJSON("/api/compare", {
        channels,
        brandName,
        brandDescription,
        researchMode: researchMode === "deep-research" ? "basic" : researchMode,
        modelConfig,
      });

      clearInterval(progressTimer);

      if (!ok) {
        setError((data.error as string) || "比較分析に失敗しました");
        return;
      }

      setComparisonSuccess({
        results: data.results as unknown as AnalysisResult[],
        comparisonSummary: (data.comparisonSummary as string) || "",
        errors: (data.errors as ComparisonError[] | undefined) || undefined,
      });
    } catch {
      clearInterval(progressTimer);
      setError("ネットワークエラーが発生しました");
    }
  };

  const analyze = useCallback(
    async (
      channelInput: string,
      brandName: string,
      brandDescription?: string,
      researchMode: ResearchMode = "basic",
      creatorResearch?: string,
      modelConfig?: ModelConfig,
    ) => {
      abortRef.current = false;

      setState({
        ...INITIAL_STATE,
        status: "loading",
        mode: "single",
        loadingStep: LOADING_STEPS[researchMode][0],
      });

      try {
        if (researchMode === "deep-research") {
          await analyzeDeepResearch(channelInput, brandName, brandDescription, modelConfig);
        } else {
          await analyzeStandard(channelInput, brandName, brandDescription, researchMode, creatorResearch, modelConfig);
        }
      } catch {
        setState((prev) =>
          prev.status === "loading"
            ? { ...prev, status: "error", result: null, comparisonResult: null, error: "ネットワークエラーが発生しました", loadingStep: "" }
            : prev
        );
      }
    },
    []
  );

  const compare = useCallback(
    async (
      channels: string[],
      brandName: string,
      brandDescription?: string,
      researchMode: ResearchMode = "basic",
      modelConfig?: ModelConfig,
    ) => {
      abortRef.current = false;

      setState({
        ...INITIAL_STATE,
        status: "loading",
        mode: "compare",
        loadingStep: `チャンネル 1/${channels.length} を分析中...`,
      });

      try {
        await analyzeCompare(channels, brandName, brandDescription, researchMode, modelConfig);
      } catch {
        setState((prev) =>
          prev.status === "loading"
            ? { ...prev, status: "error", result: null, comparisonResult: null, error: "ネットワークエラーが発生しました", loadingStep: "" }
            : prev
        );
      }
    },
    []
  );

  const reset = useCallback(() => {
    abortRef.current = true;
    setState(INITIAL_STATE);
  }, []);

  return { ...state, analyze, compare, reset };
}
