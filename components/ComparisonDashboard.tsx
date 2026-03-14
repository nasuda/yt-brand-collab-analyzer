"use client";

import { useState } from "react";
import { ComparisonResult, AnalysisResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GitCompareArrows,
  ChevronDown,
  ChevronUp,
  Trophy,
  Shield,
} from "lucide-react";
import { ChannelOverview } from "./ChannelOverview";
import { EngagementMetrics } from "./EngagementMetrics";
import { BrandFitScore } from "./BrandFitScore";
import { CollabIdeas } from "./CollabIdeas";

interface ComparisonDashboardProps {
  comparison: ComparisonResult;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-500";
}

function scoreBg(score: number): string {
  if (score >= 70) return "bg-green-50 dark:bg-green-950";
  if (score >= 40) return "bg-yellow-50 dark:bg-yellow-950";
  return "bg-red-50 dark:bg-red-950";
}

function safetyBadgeClass(rec: string): string {
  switch (rec) {
    case "推奨":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "非推奨":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  }
}

export function ComparisonDashboard({ comparison }: ComparisonDashboardProps) {
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  // スコア順にソート
  const sorted = [...comparison.results].sort(
    (a, b) => b.analysis.overallScore - a.analysis.overallScore
  );

  const toggleExpand = (channelId: string) => {
    setExpandedChannel((prev) => (prev === channelId ? null : channelId));
  };

  return (
    <div className="space-y-6">
      {/* 比較サマリー */}
      {comparison.comparisonSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5" />
              比較サマリー
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{comparison.comparisonSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* 比較テーブル */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">チャンネル比較</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">順位</th>
                <th className="text-left py-2 px-3 font-medium">チャンネル</th>
                <th className="text-center py-2 px-3 font-medium">総合スコア</th>
                <th className="text-center py-2 px-3 font-medium">登録者数</th>
                <th className="text-center py-2 px-3 font-medium">ER</th>
                <th className="text-center py-2 px-3 font-medium">カテゴリ</th>
                <th className="text-center py-2 px-3 font-medium">セーフティ</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((result, index) => (
                <ComparisonRow
                  key={result.channel.id}
                  result={result}
                  rank={index + 1}
                  isExpanded={expandedChannel === result.channel.id}
                  onToggle={() => toggleExpand(result.channel.id)}
                  isTop={index === 0}
                />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 展開された詳細 */}
      {expandedChannel && (
        <ExpandedDetail
          result={sorted.find((r) => r.channel.id === expandedChannel)!}
        />
      )}
    </div>
  );
}

function ComparisonRow({
  result,
  rank,
  isExpanded,
  onToggle,
  isTop,
}: {
  result: AnalysisResult;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  isTop: boolean;
}) {
  const { channel, analysis, metrics } = result;

  return (
    <tr className={`border-b transition-colors ${isTop ? "bg-primary/5" : ""}`}>
      <td className="py-3 px-3">
        <div className="flex items-center gap-1">
          {isTop && <Trophy className="h-4 w-4 text-yellow-500" />}
          <span className="font-bold">{rank}</span>
        </div>
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          {channel.thumbnailUrl && (
            <img
              src={channel.thumbnailUrl}
              alt={channel.title}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-medium text-sm truncate max-w-[150px]">{channel.title}</p>
            {channel.customUrl && (
              <p className="text-[11px] text-muted-foreground">{channel.customUrl}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-3 text-center">
        <span
          className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${scoreBg(
            analysis.overallScore
          )} ${scoreColor(analysis.overallScore)}`}
        >
          {analysis.overallScore}
        </span>
      </td>
      <td className="py-3 px-3 text-center text-sm">
        {formatNumber(channel.subscriberCount)}
      </td>
      <td className="py-3 px-3 text-center text-sm">
        {metrics?.engagementRate ?? "–"}%
      </td>
      <td className="py-3 px-3 text-center">
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {analysis.categoryBenchmark?.channelCategory || "–"}
        </span>
      </td>
      <td className="py-3 px-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${safetyBadgeClass(
              analysis.brandSafety.recommendation
            )}`}
          >
            {analysis.brandSafety.recommendation}
          </span>
        </div>
      </td>
      <td className="py-3 px-3">
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </td>
    </tr>
  );
}

function ExpandedDetail({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-6 border-l-4 border-primary pl-4">
      <h3 className="text-lg font-semibold">{result.channel.title} — 詳細</h3>
      <ChannelOverview channel={result.channel} />
      {result.metrics && <EngagementMetrics metrics={result.metrics} />}
      <BrandFitScore analysis={result.analysis} brandName={result.brandName} />
      <CollabIdeas ideas={result.analysis.collabIdeas} />
    </div>
  );
}
