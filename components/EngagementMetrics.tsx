"use client";

import { ChannelMetrics } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  MessageCircle,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
  Users,
  Tag,
} from "lucide-react";

interface EngagementMetricsProps {
  metrics: ChannelMetrics;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function TrendIcon({ trend }: { trend: "上昇" | "安定" | "下降" }) {
  switch (trend) {
    case "上昇":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "下降":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
}

function trendColor(trend: "上昇" | "安定" | "下降"): string {
  switch (trend) {
    case "上昇":
      return "text-green-600";
    case "下降":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

export function EngagementMetrics({ metrics }: EngagementMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          定量エンゲージメント分析
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* エンゲージメント率 */}
          <div className="rounded-lg border p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
              <span className="text-xs">エンゲージメント率</span>
            </div>
            <p className="text-2xl font-bold">{metrics.engagementRate}%</p>
            <p className="text-[11px] text-muted-foreground">
              (いいね+コメント) / 再生数
            </p>
          </div>

          {/* 平均再生数 */}
          <div className="rounded-lg border p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              <span className="text-xs">平均再生数</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(metrics.avgViews)}</p>
            <p className="text-[11px] text-muted-foreground">分析対象動画の平均</p>
          </div>

          {/* 登録者あたり再生率 */}
          <div className="rounded-lg border p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs">登録者あたり再生率</span>
            </div>
            <p className="text-2xl font-bold">{metrics.viewsPerSubscriber.toFixed(2)}</p>
            <p className="text-[11px] text-muted-foreground">平均再生数 / 登録者数</p>
          </div>

          {/* いいね率 */}
          <div className="rounded-lg border p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
              <span className="text-xs">いいね率</span>
            </div>
            <p className="text-2xl font-bold">{metrics.likeRate}%</p>
            <p className="text-[11px] text-muted-foreground">いいね / 再生数</p>
          </div>

          {/* コメント率 */}
          <div className="rounded-lg border p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="text-xs">コメント率</span>
            </div>
            <p className="text-2xl font-bold">{metrics.commentRate}%</p>
            <p className="text-[11px] text-muted-foreground">コメント / 再生数</p>
          </div>

          {/* 投稿頻度 */}
          <div className="rounded-lg border p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">投稿頻度</span>
            </div>
            <p className="text-2xl font-bold">{metrics.postingFrequency}</p>
            <p className="text-[11px] text-muted-foreground">投稿間隔の中央値から算出</p>
          </div>
        </div>

        {/* 再生数トレンド + トップタグ */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <TrendIcon trend={metrics.viewTrend} />
            <span className="text-sm">
              再生数トレンド:{" "}
              <span className={`font-medium ${trendColor(metrics.viewTrend)}`}>
                {metrics.viewTrend}
              </span>
            </span>
          </div>

          {metrics.topTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">人気タグ:</span>
              {metrics.topTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
