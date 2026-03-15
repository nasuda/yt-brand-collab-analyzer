"use client";

import { useState } from "react";
import { ResearchMode, ModelConfig, AVAILABLE_MODELS, DEFAULT_MODEL_CONFIG } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Zap, Globe, BookOpen, FileText, Plus, X, GitCompareArrows, ChevronDown, ChevronRight, Settings2 } from "lucide-react";

interface AnalysisFormProps {
  onSubmit: (channelInput: string, brandName: string, brandDescription?: string, researchMode?: ResearchMode, creatorResearch?: string, modelConfig?: ModelConfig) => void;
  onCompare: (channels: string[], brandName: string, brandDescription?: string, researchMode?: ResearchMode, modelConfig?: ModelConfig) => void;
  isLoading: boolean;
}

const MODES: { value: ResearchMode; label: string; description: string; icon: React.ReactNode; badge?: string; disableInCompare?: boolean }[] = [
  {
    value: "basic",
    label: "基本分析",
    description: "YouTubeデータのみで分析（約30秒）",
    icon: <Zap className="h-4 w-4" />,
  },
  {
    value: "search",
    label: "Web検索付き",
    description: "Google検索でクリエイター情報を補完（約1分）",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    value: "deep-research",
    label: "Deep Research",
    description: "AIが徹底的に調査・分析（5〜20分）",
    icon: <BookOpen className="h-4 w-4" />,
    badge: "$2〜5/回",
    disableInCompare: true,
  },
  {
    value: "custom-research",
    label: "カスタムリサーチ",
    description: "自分で調査したレポートを添付して分析",
    icon: <FileText className="h-4 w-4" />,
    disableInCompare: true,
  },
];

function ModelSelect({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {AVAILABLE_MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label} — {m.description}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AnalysisForm({ onSubmit, onCompare, isLoading }: AnalysisFormProps) {
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [channelInput, setChannelInput] = useState("");
  const [compareChannels, setCompareChannels] = useState<string[]>(["", ""]);
  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [researchMode, setResearchMode] = useState<ResearchMode>("basic");
  const [customResearch, setCustomResearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({ ...DEFAULT_MODEL_CONFIG });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCompareMode) {
      const validChannels = compareChannels.filter((c) => c.trim());
      // 重複チェック（正規化して比較）
      const normalized = validChannels.map((c) => c.trim().toLowerCase());
      const uniqueChannels = validChannels.filter((_, i) => normalized.indexOf(normalized[i]) === i);
      if (uniqueChannels.length < 2 || !brandName.trim()) return;
      onCompare(uniqueChannels, brandName.trim(), brandDescription.trim() || undefined, researchMode, modelConfig);
    } else {
      if (!channelInput.trim() || !brandName.trim()) return;
      if (researchMode === "custom-research" && !customResearch.trim()) return;
      onSubmit(
        channelInput.trim(),
        brandName.trim(),
        brandDescription.trim() || undefined,
        researchMode,
        researchMode === "custom-research" ? customResearch.trim() : undefined,
        modelConfig,
      );
    }
  };

  const addChannel = () => {
    if (compareChannels.length < 5) {
      setCompareChannels([...compareChannels, ""]);
    }
  };

  const removeChannel = (index: number) => {
    if (compareChannels.length > 2) {
      setCompareChannels(compareChannels.filter((_, i) => i !== index));
    }
  };

  const updateChannel = (index: number, value: string) => {
    const updated = [...compareChannels];
    updated[index] = value;
    setCompareChannels(updated);
  };

  // 比較モードで無効なモードを基本分析に戻す
  const handleModeToggle = (compare: boolean) => {
    setIsCompareMode(compare);
    if (compare && (researchMode === "deep-research" || researchMode === "custom-research")) {
      setResearchMode("basic");
    }
  };

  const filteredModes = isCompareMode
    ? MODES.filter((m) => !m.disableInCompare)
    : MODES;

  const canSubmitCompare =
    compareChannels.filter((c) => c.trim()).length >= 2 && brandName.trim();

  const canSubmitSingle =
    channelInput.trim() &&
    brandName.trim() &&
    (researchMode !== "custom-research" || customResearch.trim());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">コラボ分析を開始</CardTitle>
          <div className="flex rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => handleModeToggle(false)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                !isCompareMode
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              単体分析
            </button>
            <button
              type="button"
              onClick={() => handleModeToggle(true)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 ${
                isCompareMode
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              <GitCompareArrows className="h-3 w-3" />
              比較
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* チャンネル入力 */}
          {isCompareMode ? (
            <div className="space-y-2">
              <Label>YouTubeチャンネル（2〜5チャンネル）</Label>
              {compareChannels.map((ch, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`チャンネル ${i + 1}: @handle、URL、またはID`}
                    value={ch}
                    onChange={(e) => updateChannel(i, e.target.value)}
                    disabled={isLoading}
                  />
                  {compareChannels.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeChannel(i)}
                      className="p-2 rounded-md hover:bg-accent shrink-0"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {compareChannels.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addChannel}
                  disabled={isLoading}
                >
                  <Plus className="h-3 w-3" />
                  チャンネルを追加
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="channel">YouTubeチャンネル</Label>
              <Input
                id="channel"
                placeholder="@HikakinTV、チャンネルURL、またはチャンネルID"
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                @ハンドル名、チャンネルURL、チャンネルID、またはチャンネル名を入力
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="brand">ブランド名</Label>
            <Input
              id="brand"
              placeholder="例: Nike、スターバックス、任天堂"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandDesc">ブランド説明（任意）</Label>
            <Textarea
              id="brandDesc"
              placeholder="ブランドの特徴やコラボの目的など"
              value={brandDescription}
              onChange={(e) => setBrandDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              maxLength={5000}
            />
            {brandDescription.length > 4000 && (
              <p className="text-xs text-muted-foreground text-right">
                {brandDescription.length.toLocaleString()} / 5,000文字
              </p>
            )}
          </div>

          {/* Research Mode Selector */}
          <div className="space-y-2">
            <Label>調査モード</Label>
            <div className="grid gap-2">
              {filteredModes.map((mode) => (
                <label
                  key={mode.value}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    researchMode === mode.value
                      ? "border-primary bg-primary/5"
                      : "border-input hover:bg-accent/50"
                  } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input
                    type="radio"
                    name="researchMode"
                    value={mode.value}
                    checked={researchMode === mode.value}
                    onChange={() => setResearchMode(mode.value)}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {mode.icon}
                      <span className="font-medium text-sm">{mode.label}</span>
                      {mode.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-medium">
                          {mode.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{mode.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {!isCompareMode && researchMode === "custom-research" && (
            <div className="space-y-2">
              <Label htmlFor="customResearch">リサーチレポート</Label>
              <Textarea
                id="customResearch"
                placeholder="クリエイターについて調査した内容を貼り付けてください（評判、過去のコラボ実績、炎上歴など）"
                value={customResearch}
                onChange={(e) => setCustomResearch(e.target.value)}
                disabled={isLoading}
                rows={8}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground">
                {customResearch.length > 0
                  ? `${customResearch.length.toLocaleString()} / 5,000文字`
                  : "最大5,000文字まで"}。分析時にAIへのインプットとして使用されます。
              </p>
            </div>
          )}

          {/* 詳細設定（モデル選択） */}
          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 transition-colors"
            >
              {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Settings2 className="h-4 w-4" />
              詳細設定
            </button>
            {showAdvanced && (
              <div className="px-3 py-3 space-y-3 border-t">
                <ModelSelect
                  label="分析モデル（ブランド適合性評価）"
                  value={modelConfig.analysisModel}
                  onChange={(v) => setModelConfig((prev) => ({ ...prev, analysisModel: v }))}
                  disabled={isLoading}
                />
                <ModelSelect
                  label="リサーチモデル（Web検索・比較サマリー）"
                  value={modelConfig.researchModel}
                  onChange={(v) => setModelConfig((prev) => ({ ...prev, researchModel: v }))}
                  disabled={isLoading}
                />
                <ModelSelect
                  label="補助モデル（プリ分析・アイデアスケッチ）"
                  value={modelConfig.helperModel}
                  onChange={(v) => setModelConfig((prev) => ({ ...prev, helperModel: v }))}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || (isCompareMode ? !canSubmitCompare : !canSubmitSingle)}
          >
            <Search className="h-4 w-4" />
            {isLoading
              ? "分析中..."
              : isCompareMode
              ? `${compareChannels.filter((c) => c.trim()).length}チャンネルを比較分析`
              : "分析する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
