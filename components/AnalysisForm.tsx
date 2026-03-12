"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface AnalysisFormProps {
  onSubmit: (channelInput: string, brandName: string, brandDescription?: string) => void;
  isLoading: boolean;
}

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [channelInput, setChannelInput] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelInput.trim() || !brandName.trim()) return;
    onSubmit(channelInput.trim(), brandName.trim(), brandDescription.trim() || undefined);
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
