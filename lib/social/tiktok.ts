import type { Post, SocialConnection } from "@prisma/client";

const API = "https://open.tiktokapis.com/v2";

export async function publishToTikTok(
  post: Post,
  connection: SocialConnection,
  accessToken: string
): Promise<string> {
  const mediaUrls = post.mediaUrls as string[];

  if (mediaUrls.length === 0) {
    throw new Error("TikTok posts require a video. Please upload a video file.");
  }

  const hashtags = (post.hashtags as string[]).map((h) => h.replace("#", "")).join(",");

  // TikTok Content Posting API - direct post
  const body = {
    post_info: {
      title: post.copyText.slice(0, 150),
      description: post.copyText,
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
      privacy_level: "PUBLIC_TO_EVERYONE",
    },
    source_info: {
      source: "PULL_FROM_URL",
      video_url: mediaUrls[0],
    },
    post_mode: "DIRECT_POST",
    media_type: "VIDEO",
  };

  const res = await fetch(`${API}/post/publish/video/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`TikTok publish failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.data?.publish_id ?? "unknown";
}
