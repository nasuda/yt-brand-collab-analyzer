"use client";

import { ChannelInfo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, Video } from "lucide-react";

interface ChannelOverviewProps {
  channel: ChannelInfo;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function ChannelOverview({ channel }: ChannelOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">チャンネル概要</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          {channel.thumbnailUrl && (
            <img
              src={channel.thumbnailUrl}
              alt={channel.title}
              className="w-20 h-20 rounded-full object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{channel.title}</h3>
            {channel.customUrl && (
              <p className="text-sm text-muted-foreground">{channel.customUrl}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {channel.description || "説明なし"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{formatNumber(channel.subscriberCount)}</p>
              <p className="text-xs text-muted-foreground">登録者</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{formatNumber(channel.viewCount)}</p>
              <p className="text-xs text-muted-foreground">総再生回数</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{formatNumber(channel.videoCount)}</p>
              <p className="text-xs text-muted-foreground">動画数</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
