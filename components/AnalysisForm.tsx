"use client";

import { useState } from "react";
import { ResearchMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Zap, Globe, BookOpen } from "lucide-react";

interface AnalysisFormProps {
  onSubmit: (channelInput: string, brandName: string, brandDescription?: string, researchMode?: ResearchMode) => void;
  isLoading: boolean;
}

const MODES: { value: ResearchMode; label: string; description: string; icon: React.ReactNode; badge?: string }[] = [
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
  },
];

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [channelInput, setChannelInput] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [researchMode, setResearchMode] = useState<ResearchMode>("basic");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelInput.trim() || !brandName.trim()) return;
    onSubmit(channelInput.trim(), brandName.trim(), brandDescription.trim() || undefined, researchMode);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">コラボ分析を開始</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>

          {/* Research Mode Selector */}
          <div className="space-y-2">
            <Label>調査モード</Label>
            <div className="grid gap-2">
              {MODES.map((mode) => (
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

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !channelInput.trim() || !brandName.trim()}
          >
            <Search className="h-4 w-4" />
            {isLoading ? "分析中..." : "分析する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
