"use client";

import { BrandFitAnalysis } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface BrandFitScoreProps {
  analysis: BrandFitAnalysis;
  brandName: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
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

export function BrandFitScore({ analysis, brandName }: BrandFitScoreProps) {
  const { overallScore } = analysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ブランド適合性分析 — {brandName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                className="text-muted/20"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                className={getScoreColor(overallScore)}
                strokeWidth="8"
                strokeDasharray={`${(overallScore / 100) * 264} 264`}
                strokeLinecap="round"
              />
            </svg>
            <span className={`absolute text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </span>
          </div>
          <div>
            <p className="font-semibold text-lg">{getScoreLabel(overallScore)}</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden max-w-48">
              <div
                className={`h-full rounded-full ${getScoreBg(overallScore)}`}
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Style */}
        <div>
          <h4 className="font-medium mb-1">コンテンツスタイル</h4>
          <p className="text-sm text-muted-foreground">{analysis.contentStyleSummary}</p>
        </div>

        {/* Audience Profile */}
        <div>
          <h4 className="font-medium mb-1">視聴者プロファイル</h4>
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
            <ul className="space-y-1">
              {analysis.risks.map((r, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5 shrink-0">!</Badge>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
