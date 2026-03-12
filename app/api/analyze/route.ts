import { NextRequest, NextResponse } from "next/server";
import { validateAnalysisRequest } from "@/lib/validators";
import { resolveChannel, getVideos, getVideoComments } from "@/lib/youtube";
import { analyzeBrandFit } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateAnalysisRequest(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { channelInput, brandName, brandDescription } = validation.data;

    // Step 1: Resolve channel
    const { channel, uploadsPlaylistId } = await resolveChannel(channelInput);

    // Step 2: Get videos (latest 5 + popular 5)
    const videos = await getVideos(uploadsPlaylistId, channel.id);

    // Step 3: Get comments for selected videos
    const comments = await getVideoComments(videos.map((v) => v.id));

    // Step 4: Analyze with Gemini
    const analysis = await analyzeBrandFit(
      channel,
      videos,
      comments,
      brandName,
      brandDescription
    );

    return NextResponse.json({
      channel,
      videos,
      analysis,
      brandName,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "分析中にエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
