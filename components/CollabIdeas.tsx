"use client";

import { CollabIdea } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles } from "lucide-react";

interface CollabIdeasProps {
  ideas: CollabIdea[];
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
        <div className="grid gap-4 md:grid-cols-2">
          {ideas.map((idea, i) => (
            <div
              key={i}
              className="rounded-lg border p-4 space-y-2 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium">{idea.title}</h4>
                <Badge variant="secondary">{idea.format}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{idea.description}</p>
              <div className="flex items-center gap-1 text-sm">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-primary font-medium">期待効果:</span>
                <span className="text-muted-foreground">{idea.expectedImpact}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
