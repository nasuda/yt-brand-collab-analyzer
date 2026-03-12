"use client";

import { CollabIdea } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, Target, Shield, Zap } from "lucide-react";

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

export function CollabIdeas({ ideas }: CollabIdeasProps) {
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

              <p className="text-sm text-muted-foreground">{idea.description}</p>

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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
