"use client";

import { VideoInfo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, ThumbsUp, MessageSquare } from "lucide-react";

interface VideoListProps {
  videos: VideoInfo[];
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function VideoList({ videos }: VideoListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">分析対象動画（{videos.length}本）</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              {video.thumbnailUrl && (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-32 h-18 rounded object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(video.publishedAt).toLocaleDateString("ja-JP")}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {formatNumber(video.viewCount)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ThumbsUp className="h-3 w-3" />
                    {formatNumber(video.likeCount)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {formatNumber(video.commentCount)}
                  </span>
                </div>
                {video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {video.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
