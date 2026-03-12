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
  nextPageToken?: string;
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

    case "username":
      channelData = await ytFetch<YouTubeChannelResponse>("channels", {
        part: "snippet,statistics,contentDetails",
        forUsername: parsed.value,
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

export async function getVideos(uploadsPlaylistId: string): Promise<VideoInfo[]> {
  // playlistItems を最大3ページ（150本）取得してクォータ節約（3単位 vs search.listの100単位）
  const allVideoIds: string[] = [];
  let pageToken: string | undefined;
  const MAX_PAGES = 3;

  for (let page = 0; page < MAX_PAGES; page++) {
    const params: Record<string, string> = {
      part: "snippet",
      playlistId: uploadsPlaylistId,
      maxResults: "50",
    };
    if (pageToken) params.pageToken = pageToken;

    const playlistData = await ytFetch<YouTubePlaylistItemsResponse>("playlistItems", params);
    const ids = playlistData.items?.map((item) => item.snippet.resourceId.videoId) || [];
    allVideoIds.push(...ids);

    pageToken = playlistData.nextPageToken;
    if (!pageToken) break;
  }

  if (allVideoIds.length === 0) return [];

  // videos.list でバッチ取得（50件ずつ）
  const allVideos: VideoInfo[] = [];
  for (let i = 0; i < allVideoIds.length; i += 50) {
    const batch = allVideoIds.slice(i, i + 50);
    const videosData = await ytFetch<YouTubeVideosResponse>("videos", {
      part: "snippet,statistics",
      id: batch.join(","),
    });
    if (videosData.items) {
      allVideos.push(...videosData.items.map(toVideoInfo));
    }
  }

  // 最新5本（allVideoIdsの順序=新しい順）
  const latest5 = allVideos.slice(0, 5);
  const latest5Ids = new Set(latest5.map((v) => v.id));

  // 残りから再生数上位5本（チャンネル全体150本の中から選定）
  const remaining = allVideos.filter((v) => !latest5Ids.has(v.id));
  remaining.sort((a, b) => b.viewCount - a.viewCount);
  const popular5 = remaining.slice(0, 5);

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
