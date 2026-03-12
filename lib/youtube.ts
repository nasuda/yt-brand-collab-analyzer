import { ChannelInfo, VideoInfo, CommentInfo } from "./types";
import { parseChannelInput } from "./validators";

const API_KEY = process.env.YOUTUBE_API_KEY!;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

async function ytFetch<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set("key", API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `YouTube API error: ${res.status} - ${error?.error?.message || res.statusText}`
    );
  }
  return res.json() as Promise<T>;
}

interface YouTubeChannelResponse {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      customUrl?: string;
      thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
      publishedAt: string;
    };
    statistics: {
      subscriberCount: string;
      videoCount: string;
      viewCount: string;
    };
    contentDetails: {
      relatedPlaylists: { uploads: string };
    };
  }>;
}

interface YouTubeSearchResponse {
  items?: Array<{
    id: { videoId?: string; channelId?: string };
    snippet: { channelId: string };
  }>;
}

interface YouTubePlaylistItemsResponse {
  items?: Array<{
    snippet: {
      resourceId: { videoId: string };
    };
  }>;
}

interface YouTubeVideosResponse {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
      tags?: string[];
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
  }>;
}

interface YouTubeCommentThreadsResponse {
  items?: Array<{
    snippet: {
      topLevelComment: {
        snippet: {
          textDisplay: string;
          textOriginal: string;
          likeCount: number;
          publishedAt: string;
        };
      };
    };
  }>;
}

export async function resolveChannel(input: string): Promise<{ channel: ChannelInfo; uploadsPlaylistId: string }> {
  const parsed = parseChannelInput(input);
  let channelData: YouTubeChannelResponse;

  switch (parsed.type) {
    case "channelId":
      channelData = await ytFetch<YouTubeChannelResponse>("channels", {
        part: "snippet,statistics,contentDetails",
        id: parsed.value,
      });
      break;

    case "handle":
      channelData = await ytFetch<YouTubeChannelResponse>("channels", {
        part: "snippet,statistics,contentDetails",
        forHandle: parsed.value.replace(/^@/, ""),
      });
      break;

    case "text":
    default: {
      const searchResult = await ytFetch<YouTubeSearchResponse>("search", {
        part: "snippet",
        q: parsed.value,
        type: "channel",
        maxResults: "1",
      });

      const channelId = searchResult.items?.[0]?.id?.channelId || searchResult.items?.[0]?.snippet?.channelId;
      if (!channelId) {
        throw new Error(`チャンネルが見つかりません: ${parsed.value}`);
      }

      channelData = await ytFetch<YouTubeChannelResponse>("channels", {
        part: "snippet,statistics,contentDetails",
        id: channelId,
      });
      break;
    }
  }

  const item = channelData.items?.[0];
  if (!item) {
    throw new Error(`チャンネルが見つかりません: ${input}`);
  }

  const thumbnail =
    item.snippet.thumbnails.high?.url ||
    item.snippet.thumbnails.medium?.url ||
    item.snippet.thumbnails.default?.url ||
    "";

  return {
    channel: {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      customUrl: item.snippet.customUrl || "",
      thumbnailUrl: thumbnail,
      subscriberCount: parseInt(item.statistics.subscriberCount) || 0,
      videoCount: parseInt(item.statistics.videoCount) || 0,
      viewCount: parseInt(item.statistics.viewCount) || 0,
      publishedAt: item.snippet.publishedAt,
    },
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
  };
}

function toVideoInfo(item: NonNullable<YouTubeVideosResponse["items"]>[number]): VideoInfo {
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description.slice(0, 500),
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl:
      item.snippet.thumbnails.high?.url ||
      item.snippet.thumbnails.medium?.url ||
      item.snippet.thumbnails.default?.url ||
      "",
    viewCount: parseInt(item.statistics.viewCount) || 0,
    likeCount: parseInt(item.statistics.likeCount) || 0,
    commentCount: parseInt(item.statistics.commentCount) || 0,
    tags: item.snippet.tags?.slice(0, 10) || [],
  };
}

export async function getVideos(
  uploadsPlaylistId: string,
  channelId: string
): Promise<VideoInfo[]> {
  // 最新動画とチャンネル全体の人気動画を並行取得
  const [playlistData, popularSearchData] = await Promise.all([
    // 最新アップロード（最大10本）
    ytFetch<YouTubePlaylistItemsResponse>("playlistItems", {
      part: "snippet",
      playlistId: uploadsPlaylistId,
      maxResults: "10",
    }),
    // チャンネル全体から人気動画を検索（viewCount順）
    ytFetch<YouTubeSearchResponse>("search", {
      part: "snippet",
      channelId,
      order: "viewCount",
      type: "video",
      maxResults: "10",
    }),
  ]);

  const latestIds = playlistData.items?.map((item) => item.snippet.resourceId.videoId) || [];
  const popularVideoIds = popularSearchData.items
    ?.map((item) => item.id.videoId)
    .filter((id): id is string => !!id) || [];

  const allIds = [...new Set([...latestIds, ...popularVideoIds])];
  if (allIds.length === 0) return [];

  // 統計情報をバッチ取得
  const videosData = await ytFetch<YouTubeVideosResponse>("videos", {
    part: "snippet,statistics",
    id: allIds.join(","),
  });

  const videoMap = new Map(
    videosData.items?.map((item) => [item.id, toVideoInfo(item)]) || []
  );

  // 最新5本（順序保持）
  const latest5: VideoInfo[] = [];
  for (const id of latestIds) {
    if (latest5.length >= 5) break;
    const v = videoMap.get(id);
    if (v) latest5.push(v);
  }

  // チャンネル全体の人気上位5本（最新5本と重複除外）
  const latestIdSet = new Set(latest5.map((v) => v.id));
  const popular5: VideoInfo[] = [];
  for (const id of popularVideoIds) {
    if (popular5.length >= 5) break;
    if (latestIdSet.has(id)) continue;
    const v = videoMap.get(id);
    if (v) popular5.push(v);
  }

  return [...latest5, ...popular5];
}

export async function getVideoComments(
  videoIds: string[],
  perVideo: number = 30
): Promise<CommentInfo[]> {
  const results = await Promise.allSettled(
    videoIds.map(async (videoId) => {
      const data = await ytFetch<YouTubeCommentThreadsResponse>("commentThreads", {
        part: "snippet",
        videoId,
        maxResults: String(perVideo),
        order: "relevance",
      });

      return (
        data.items?.map((item) => ({
          videoId,
          text: (item.snippet.topLevelComment.snippet.textOriginal || item.snippet.topLevelComment.snippet.textDisplay).slice(0, 300),
          likeCount: item.snippet.topLevelComment.snippet.likeCount,
          publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
        })) || []
      );
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<CommentInfo[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);
}
