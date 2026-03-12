"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  step: string;
}

export function LoadingState({ step }: LoadingStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">{step}</p>
        <p className="text-sm text-muted-foreground mt-2">
          しばらくお待ちください（30秒〜1分程度）
        </p>
      </CardContent>
    </Card>
  );
}
