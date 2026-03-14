"use client";

import {
  CategoryBenchmark as CategoryBenchmarkType,
  AudiencePersona,
  SimilarCreator,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Layers,
  Target,
  Users,
  MapPin,
  Sparkles,
  UserCheck,
} from "lucide-react";

interface CategoryBenchmarkProps {
  benchmark: CategoryBenchmarkType;
  persona: AudiencePersona;
  similarCreators: SimilarCreator[];
}

export function CategoryBenchmark({
  benchmark,
  persona,
  similarCreators,
}: CategoryBenchmarkProps) {
  return (
    <div className="space-y-6">
      {/* カテゴリベンチマーク */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            カテゴリベンチマーク
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
              {benchmark.channelCategory}
            </span>
            <span className="text-sm text-muted-foreground">
              {benchmark.categoryTier}
            </span>
          </div>

          <div className="grid gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Target className="h-3 w-3" />
                エンゲージメント比較
              </p>
              <p className="text-sm">{benchmark.engagementComparison}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                再生効率比較
              </p>
              <p className="text-sm">{benchmark.viewEfficiencyComparison}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* オーディエンスペルソナ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            推定オーディエンスペルソナ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {persona.summary && (
            <p className="text-sm text-muted-foreground">{persona.summary}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">年齢層</p>
              <p className="text-sm font-medium">{persona.estimatedAgeRange}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">性別比</p>
              <p className="text-sm font-medium">{persona.estimatedGenderSplit}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                地域
              </p>
              <p className="text-sm font-medium">{persona.estimatedRegion}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground mb-1">興味関心</p>
              <div className="flex flex-wrap gap-1">
                {persona.estimatedInterests.map((interest) => (
                  <span
                    key={interest}
                    className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 類似クリエイター */}
      {similarCreators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              類似クリエイター
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {similarCreators.map((creator) => (
                <div key={creator.name} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{creator.name}</span>
                    {creator.handle && (
                      <span className="text-xs text-muted-foreground">
                        {creator.handle}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {creator.reason}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
