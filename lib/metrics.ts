import { ChannelInfo, VideoInfo, ChannelMetrics } from "./types";

export function computeMetrics(
  channel: ChannelInfo,
  videos: VideoInfo[]
): ChannelMetrics {
  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0);
  const totalComments = videos.reduce((sum, v) => sum + v.commentCount, 0);

  const engagementRate =
    totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

  const avgViews = videos.length > 0 ? totalViews / videos.length : 0;

  const viewsPerSubscriber =
    channel.subscriberCount > 0 ? avgViews / channel.subscriberCount : 0;

  const likeRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;

  const commentRate =
    totalViews > 0 ? (totalComments / totalViews) * 100 : 0;

  // 時系列指標は重複除去＋投稿日順ソートした動画で算出
  // （getVideos()は最新動画と人気動画を混在させるため、同じ動画が重複する可能性がある）
  const uniqueVideos = deduplicateByDate(videos);

  // 投稿頻度: 投稿日でソートし、隣接する動画間の日数差の中央値から算出
  const postingFrequency = calcPostingFrequency(uniqueVideos);

  // viewTrend: 最新半分 vs 古い半分の再生数中央値比較
  const viewTrend = calcViewTrend(uniqueVideos);

  // topTags: 全動画のタグ出現回数上位5つ
  const topTags = calcTopTags(videos, 5);

  return {
    engagementRate: round(engagementRate, 2),
    avgViews: Math.round(avgViews),
    viewsPerSubscriber: round(viewsPerSubscriber, 2),
    likeRate: round(likeRate, 2),
    commentRate: round(commentRate, 3),
    postingFrequency,
    viewTrend,
    topTags,
  };
}

/** ID重複を除去し、投稿日が新しい順にソートして返す */
function deduplicateByDate(videos: VideoInfo[]): VideoInfo[] {
  const seen = new Set<string>();
  const unique: VideoInfo[] = [];
  for (const v of videos) {
    if (!seen.has(v.id)) {
      seen.add(v.id);
      unique.push(v);
    }
  }
  return unique.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function calcPostingFrequency(videos: VideoInfo[]): string {
  if (videos.length < 2) return "データ不足";

  const sorted = [...videos].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const intervals: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff =
      new Date(sorted[i].publishedAt).getTime() -
      new Date(sorted[i + 1].publishedAt).getTime();
    intervals.push(diff / (1000 * 60 * 60 * 24)); // days
  }

  const medianDays = median(intervals);

  if (medianDays <= 0) return "データ不足";
  if (medianDays < 1) return "1日複数本";

  const postsPerWeek = 7 / medianDays;

  if (postsPerWeek >= 7) return "毎日";
  if (postsPerWeek >= 1) return `週${Math.round(postsPerWeek)}本`;

  const postsPerMonth = 30 / medianDays;
  return `月${Math.round(postsPerMonth)}本`;
}

function calcViewTrend(
  videos: VideoInfo[]
): "上昇" | "安定" | "下降" {
  if (videos.length < 4) return "安定";

  const sorted = [...videos].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // 最新半分 vs 古い半分
  const mid = Math.floor(sorted.length / 2);
  const recentViews = sorted.slice(0, mid).map((v) => v.viewCount);
  const olderViews = sorted.slice(mid).map((v) => v.viewCount);

  const recentMedian = median(recentViews);
  const olderMedian = median(olderViews);

  if (olderMedian === 0) return "安定";

  const ratio = recentMedian / olderMedian;

  if (ratio > 1.2) return "上昇";
  if (ratio < 0.8) return "下降";
  return "安定";
}

function calcTopTags(videos: VideoInfo[], limit: number): string[] {
  const tagCount = new Map<string, number>();
  for (const video of videos) {
    for (const tag of video.tags) {
      const normalized = tag.trim().toLowerCase();
      if (normalized) {
        tagCount.set(normalized, (tagCount.get(normalized) || 0) + 1);
      }
    }
  }

  return [...tagCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}
