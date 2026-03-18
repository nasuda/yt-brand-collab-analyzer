"use client";

import { useState } from "react";
import { CollabIdea } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, Target, Shield, Zap, FileEdit, Megaphone, ChevronDown, ChevronRight, Users, Eye, CheckCircle2, XCircle, Palette, MessageSquare } from "lucide-react";

interface CollabIdeasProps {
  ideas: CollabIdea[];
}

function getFeasibilityStyle(f: string) {
  switch (f) {
    case "低": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "中": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "高": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default: return "";
  }
}

function getFunnelStyle(stage: string) {
  switch (stage) {
    case "認知": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "検討": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "獲得": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default: return "";
  }
}

function getRiskLevelStyle(level: string) {
  switch (level) {
    case "安全策": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "標準": return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200";
    case "挑戦的": return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200";
    default: return "";
  }
}

function getCampaignTypeStyle(type: string) {
  switch (type) {
    case "単発": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    case "シリーズ": return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
    case "キャンペーン": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    default: return "";
  }
}

function hasPostingInstruction(idea: CollabIdea): boolean {
  const p = idea.postingInstruction;
  return !!(p && (p.contentDirection || p.descriptionBoxSuggestion || p.keyMessages.length > 0 || p.toneAndManner || p.brandMustDo?.length > 0 || p.creatorContext));
}

function hasDistributionStrategy(idea: CollabIdea): boolean {
  const d = idea.distributionStrategy;
  return !!(d && (d.adProduct || d.mixStrategy || d.audienceTargeting || d.budgetAllocation));
}

export function CollabIdeas({ ideas }: CollabIdeasProps) {
  const [openPostingIds, setOpenPostingIds] = useState<Set<number>>(new Set());
  const [openDistributionIds, setOpenDistributionIds] = useState<Set<number>>(new Set());

  const togglePosting = (i: number) => {
    setOpenPostingIds(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const toggleDistribution = (i: number) => {
    setOpenDistributionIds(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          コラボ企画案
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {ideas.map((idea, i) => (
            <div
              key={i}
              className="rounded-lg border p-4 space-y-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium">{idea.title}</h4>
                <div className="flex gap-1.5 shrink-0">
                  <Badge variant="secondary">{idea.format}</Badge>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${getFeasibilityStyle(idea.feasibility)}`}>
                    難易度: {idea.feasibility}
                  </span>
                </div>
              </div>

              {/* 新フィールドバッジ */}
              <div className="flex flex-wrap gap-1.5">
                {idea.funnelStage && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${getFunnelStyle(idea.funnelStage)}`}>
                    {idea.funnelStage}
                  </span>
                )}
                {idea.riskLevel && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${getRiskLevelStyle(idea.riskLevel)}`}>
                    {idea.riskLevel}
                  </span>
                )}
                {idea.campaignType && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${getCampaignTypeStyle(idea.campaignType)}`}>
                    {idea.campaignType}
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{idea.description}</p>

              {idea.creatorPattern && (
                <div className="flex items-start gap-1.5 text-sm">
                  <Users className="h-3 w-3 text-teal-500 mt-0.5 shrink-0" />
                  <span><span className="text-teal-500 font-medium">クリエイターの型:</span> <span className="text-muted-foreground">{idea.creatorPattern}</span></span>
                </div>
              )}

              {idea.viewerHook && (
                <div className="flex items-start gap-1.5 text-sm">
                  <Eye className="h-3 w-3 text-pink-500 mt-0.5 shrink-0" />
                  <span><span className="text-pink-500 font-medium">視聴者フック:</span> <span className="text-muted-foreground">{idea.viewerHook}</span></span>
                </div>
              )}

              {idea.basedOn && (
                <div className="flex items-start gap-1.5 text-sm">
                  <Zap className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                  <span><span className="text-blue-500 font-medium">着想元:</span> <span className="text-muted-foreground">{idea.basedOn}</span></span>
                </div>
              )}

              <div className="flex items-start gap-1.5 text-sm">
                <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                <span><span className="text-primary font-medium">期待効果:</span> <span className="text-muted-foreground">{idea.expectedImpact}</span></span>
              </div>

              <div className="flex items-start gap-1.5 text-sm">
                <Target className="h-3 w-3 text-violet-500 mt-0.5 shrink-0" />
                <span><span className="text-violet-500 font-medium">KPI:</span> <span className="text-muted-foreground">{idea.targetKPI}</span></span>
              </div>

              {idea.brandSafetyNote && idea.brandSafetyNote !== "特になし" && (
                <div className="flex items-start gap-1.5 text-sm">
                  <Shield className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                  <span><span className="text-yellow-500 font-medium">安全性:</span> <span className="text-muted-foreground">{idea.brandSafetyNote}</span></span>
                </div>
              )}

              {/* 投稿指示書アコーディオン */}
              {hasPostingInstruction(idea) && (
                <div className="border rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => togglePosting(i)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
                  >
                    {openPostingIds.has(i) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <FileEdit className="h-4 w-4" />
                    投稿指示書
                  </button>
                  {openPostingIds.has(i) && (
                    <div className="px-3 py-3 space-y-3 text-sm border-t">
                      {/* クリエイターコンテキスト */}
                      {idea.postingInstruction.creatorContext && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-md p-3">
                          <p className="font-medium text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5" />
                            クリエイターコンテキスト
                          </p>
                          <p className="text-muted-foreground">{idea.postingInstruction.creatorContext}</p>
                        </div>
                      )}

                      {/* 構成ガイド */}
                      {idea.postingInstruction.contentDirection && (
                        <div>
                          <p className="font-medium text-emerald-700 dark:text-emerald-400 mb-1">構成ガイド</p>
                          <p className="text-muted-foreground">{idea.postingInstruction.contentDirection}</p>
                        </div>
                      )}

                      {/* ブランド必須 / NG の2カラム */}
                      {(idea.postingInstruction.brandMustDo?.length > 0 || idea.postingInstruction.brandMustNot?.length > 0) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {idea.postingInstruction.brandMustDo?.length > 0 && (
                            <div className="bg-green-50 dark:bg-green-950/30 rounded-md p-3">
                              <p className="font-medium text-green-700 dark:text-green-400 mb-1.5 flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                ブランド必須要件
                              </p>
                              <ul className="space-y-1">
                                {idea.postingInstruction.brandMustDo.map((item, j) => (
                                  <li key={j} className="text-muted-foreground flex items-start gap-1.5">
                                    <span className="text-green-500 mt-0.5 shrink-0">&#x2022;</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {idea.postingInstruction.brandMustNot?.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-950/30 rounded-md p-3">
                              <p className="font-medium text-red-700 dark:text-red-400 mb-1.5 flex items-center gap-1.5">
                                <XCircle className="h-3.5 w-3.5" />
                                NG行為・表現
                              </p>
                              <ul className="space-y-1">
                                {idea.postingInstruction.brandMustNot.map((item, j) => (
                                  <li key={j} className="text-muted-foreground flex items-start gap-1.5">
                                    <span className="text-red-500 mt-0.5 shrink-0">&#x2022;</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* クリエイターの自由裁量 */}
                      {idea.postingInstruction.creatorFreedom?.length > 0 && (
                        <div className="bg-violet-50 dark:bg-violet-950/30 rounded-md p-3">
                          <p className="font-medium text-violet-700 dark:text-violet-400 mb-1.5 flex items-center gap-1.5">
                            <Palette className="h-3.5 w-3.5" />
                            クリエイターの自由裁量
                          </p>
                          <ul className="space-y-1">
                            {idea.postingInstruction.creatorFreedom.map((item, j) => (
                              <li key={j} className="text-muted-foreground flex items-start gap-1.5">
                                <span className="text-violet-500 mt-0.5 shrink-0">&#x2022;</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 導入セリフ例 */}
                      {idea.postingInstruction.sampleOpening && (
                        <div className="border-l-3 border-emerald-400 pl-3">
                          <p className="font-medium text-emerald-700 dark:text-emerald-400 mb-1">導入セリフ例</p>
                          <p className="text-muted-foreground italic">&ldquo;{idea.postingInstruction.sampleOpening}&rdquo;</p>
                        </div>
                      )}

                      {/* キーメッセージ */}
                      {idea.postingInstruction.keyMessages.length > 0 && (
                        <div>
                          <p className="font-medium text-emerald-700 dark:text-emerald-400 mb-1">キーメッセージ</p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                            {idea.postingInstruction.keyMessages.map((msg, j) => (
                              <li key={j}>{msg}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* トーン&マナー */}
                      {idea.postingInstruction.toneAndManner && (
                        <div>
                          <p className="font-medium text-emerald-700 dark:text-emerald-400 mb-1">トーン&マナー</p>
                          <p className="text-muted-foreground">{idea.postingInstruction.toneAndManner}</p>
                        </div>
                      )}

                      {/* 概要欄テンプレート */}
                      {idea.postingInstruction.descriptionBoxSuggestion && (
                        <div>
                          <p className="font-medium text-emerald-700 dark:text-emerald-400 mb-1">概要欄テンプレート</p>
                          <pre className="text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded p-2 text-xs">{idea.postingInstruction.descriptionBoxSuggestion}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 配信戦略アコーディオン */}
              {hasDistributionStrategy(idea) && (
                <div className="border rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleDistribution(i)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors"
                  >
                    {openDistributionIds.has(i) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Megaphone className="h-4 w-4" />
                    配信戦略
                  </button>
                  {openDistributionIds.has(i) && (
                    <div className="px-3 py-3 space-y-3 text-sm border-t">
                      {idea.distributionStrategy.adProduct && (
                        <div>
                          <p className="font-medium text-indigo-700 dark:text-indigo-400 mb-1">推奨広告プロダクト</p>
                          <p className="text-muted-foreground">{idea.distributionStrategy.adProduct}</p>
                        </div>
                      )}
                      {idea.distributionStrategy.mixStrategy && (
                        <div>
                          <p className="font-medium text-indigo-700 dark:text-indigo-400 mb-1">ミックス戦略</p>
                          <p className="text-muted-foreground">{idea.distributionStrategy.mixStrategy}</p>
                        </div>
                      )}
                      {idea.distributionStrategy.audienceTargeting && (
                        <div>
                          <p className="font-medium text-indigo-700 dark:text-indigo-400 mb-1">オーディエンスターゲティング</p>
                          <p className="text-muted-foreground">{idea.distributionStrategy.audienceTargeting}</p>
                        </div>
                      )}
                      {idea.distributionStrategy.budgetAllocation && (
                        <div>
                          <p className="font-medium text-indigo-700 dark:text-indigo-400 mb-1">予算配分</p>
                          <p className="text-muted-foreground">{idea.distributionStrategy.budgetAllocation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
