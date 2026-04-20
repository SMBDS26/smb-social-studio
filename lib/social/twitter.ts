import type { Post, SocialConnection } from "@prisma/client";

const API = "https://api.twitter.com/2";

export async function publishToTwitter(
  post: Post,
  connection: SocialConnection,
  accessToken: string,
  _refreshToken: string | null
): Promise<string> {
  const hashtags = (post.hashtags as string[]).join(" ");
  // Twitter has 280 char limit — truncate if needed
  const base = `${post.copyText} ${hashtags}`.trim();
  const text = base.length > 280 ? base.slice(0, 277) + "..." : base;

  const body: Record<string, unknown> = { text };

  const mediaUrls = post.mediaUrls as string[];
  if (mediaUrls.length > 0) {
    // Note: Twitter requires media upload via v1.1 API before attaching
    // For now, append URL to text if it's under limit
    const withMedia = `${text} ${mediaUrls[0]}`.trim();
    if (withMedia.length <= 280) body.text = withMedia;
  }

  const res = await fetch(`${API}/tweets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Twitter publish failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.data?.id ?? "unknown";
}
