"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, FileText } from "lucide-react";
import type { ReportSettings } from "./PrintableReport";

interface ReportSettingsModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (settings: ReportSettings) => Promise<void>;
  generating: boolean;
}

const SECTION_OPTIONS = [
  { key: "cover", label: "表紙" },
  { key: "summary", label: "エグゼクティブサマリー" },
  { key: "metrics", label: "定量メトリクス" },
  { key: "videos", label: "分析対象動画" },
  { key: "benchmark", label: "カテゴリベンチマーク & オーディエンス" },
  { key: "safety", label: "ブランドセーフティ" },
  { key: "ideas", label: "コラボ企画案" },
  { key: "strengths", label: "強み & リスク" },
] as const;

export function ReportSettingsModal({
  open,
  onClose,
  onGenerate,
  generating,
}: ReportSettingsModalProps) {
  const [authorName, setAuthorName] = useState("");
  const [sections, setSections] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTION_OPTIONS.map((s) => [s.key, true]))
  );
  const [collabIdeasCount, setCollabIdeasCount] = useState<"top3" | "all">("top3");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const toggleSection = (key: string) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasSelectedSections = Object.values(sections).some(Boolean);

  const handleGenerate = async () => {
    setError(null);
    try {
      await onGenerate({ authorName, sections, collabIdeasCount });
    } catch (err) {
      setError(err instanceof Error ? err.message : "レポート生成に失敗しました");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            レポート設定
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent"
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="authorName">作成者名（任意）</Label>
            <Input
              id="authorName"
              placeholder="例: 山田太郎"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>含めるセクション</Label>
            <div className="space-y-2">
              {SECTION_OPTIONS.map((option) => (
                <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections[option.key] ?? true}
                    onChange={() => toggleSection(option.key)}
                    className="rounded"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>企画案の表示数</Label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="collabCount"
                  checked={collabIdeasCount === "top3"}
                  onChange={() => setCollabIdeasCount("top3")}
                />
                <span className="text-sm">Top 3</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="collabCount"
                  checked={collabIdeasCount === "all"}
                  onChange={() => setCollabIdeasCount("all")}
                />
                <span className="text-sm">全件</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 border-t space-y-2">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!hasSelectedSections && (
            <p className="text-sm text-muted-foreground">セクションを1つ以上選択してください</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={generating}>
              キャンセル
            </Button>
            <Button onClick={handleGenerate} disabled={generating || !hasSelectedSections}>
              {generating ? "レポート生成中..." : "レポート生成"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
