"use client";

import { BrandFitAnalysis, RiskSource } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, Shield, ExternalLink } from "lucide-react";

/** http/https のみ許可（多層防御: サーバー側でもチェック済み） */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

interface BrandFitScoreProps {
  analysis: BrandFitAnalysis;
  brandName: string;
}

function getScoreColor(score: number, max: number = 100): string {
  const pct = (score / max) * 100;
  if (pct >= 80) return "text-green-500";
  if (pct >= 60) return "text-yellow-500";
  if (pct >= 40) return "text-orange-500";
  return "text-red-500";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "非常に高い適合性";
  if (score >= 60) return "高い適合性";
  if (score >= 40) return "中程度の適合性";
  return "低い適合性";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function getRecommendationStyle(rec: string) {
  switch (rec) {
    case "推奨": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "条件付き推奨": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "非推奨": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default: return "";
  }
}

const SCORE_AXES = [
  { key: "contentAffinity" as const, reasonKey: "contentAffinityReason" as const, label: "コンテンツ親和性" },
  { key: "audienceMatch" as const, reasonKey: "audienceMatchReason" as const, label: "視聴者層の一致" },
  { key: "engagementQuality" as const, reasonKey: "engagementQualityReason" as const, label: "エンゲージメント品質" },
  { key: "brandSafety" as const, reasonKey: "brandSafetyReason" as const, label: "ブランドセーフティ" },
  { key: "feasibility" as const, reasonKey: "feasibilityReason" as const, label: "実行可能性" },
];

function SourceList({ sources }: { sources: RiskSource[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {sources.map((src, i) =>
        src.url && isSafeUrl(src.url) ? (
          <a
            key={i}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900 transition-colors"
          >
            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate max-w-48">{src.title}</span>
          </a>
        ) : (
          <span
            key={i}
            className="inline-flex items-center text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
          >
            {src.title}
          </span>
        )
      )}
    </div>
  );
}

export function BrandFitScore({ analysis, brandName }: BrandFitScoreProps) {
  const { overallScore, scoreBreakdown, brandSafety } = analysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ブランド適合性分析 — {brandName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Score */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-muted/20" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className={getScoreColor(overallScore)} strokeWidth="8" strokeDasharray={`${(overallScore / 100) * 264} 264`} strokeLinecap="round" />
            </svg>
            <span className={`absolute text-2xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
          </div>
          <div>
            <p className="font-semibold text-lg">{getScoreLabel(overallScore)}</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden max-w-48">
              <div className={`h-full rounded-full ${getScoreBg(overallScore)}`} style={{ width: `${overallScore}%` }} />
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">スコア内訳（各20点満点）</h4>
          {SCORE_AXES.map(({ key, reasonKey, label }) => {
            const value = scoreBreakdown[key];
            const reason = scoreBreakdown[reasonKey];
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-40 shrink-0">{label}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full ${getScoreBg((value / 20) * 100)}`} style={{ width: `${(value / 20) * 100}%` }} />
                  </div>
                  <span className={`text-sm font-medium w-8 text-right ${getScoreColor(value, 20)}`}>{value}</span>
                </div>
                {reason && (
                  <p className="text-xs text-muted-foreground ml-40 pl-3">{reason}</p>
                )}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Brand Safety */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-1">
            <Shield className="h-4 w-4" />
            ブランドセーフティ
          </h4>
          <div className="flex items-center gap-3">
            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getRecommendationStyle(brandSafety.recommendation)}`}>
              {brandSafety.recommendation}
            </span>
            <span className="text-sm text-muted-foreground">安全性スコア: {brandSafety.safetyScore}/100</span>
          </div>
          {brandSafety.concerns.length > 0 && (
            <ul className="space-y-2 mt-1">
              {brandSafety.concerns.map((c, i) => (
                <li key={i} className="text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                    <div>
                      <span>{c.description}</span>
                      <SourceList sources={c.sources} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />

        {/* Content Style */}
        <div>
          <h4 className="font-medium mb-1">コンテンツスタイル</h4>
          <p className="text-sm text-muted-foreground">{analysis.contentStyleSummary}</p>
        </div>

        {/* Audience Profile */}
        <div>
          <h4 className="font-medium mb-1">推定視聴者プロファイル</h4>
          <p className="text-sm text-muted-foreground">{analysis.audienceProfile}</p>
        </div>

        {/* Brand Alignment */}
        <div>
          <h4 className="font-medium mb-1">適合性の理由</h4>
          <p className="text-sm text-muted-foreground">{analysis.brandAlignmentReasoning}</p>
        </div>

        <Separator />

        {/* Strengths & Risks */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              強み
            </h4>
            <ul className="space-y-1">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5 shrink-0">+</Badge>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              リスク
            </h4>
            <ul className="space-y-2">
              {analysis.risks.map((r, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5 shrink-0">!</Badge>
                  <div>
                    <span>{r.description}</span>
                    <SourceList sources={r.sources} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
