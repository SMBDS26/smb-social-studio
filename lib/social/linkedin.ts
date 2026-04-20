import type { Post, SocialConnection } from "@prisma/client";

const API = "https://api.linkedin.com/v2";

export async function publishToLinkedIn(
  post: Post,
  connection: SocialConnection,
  accessToken: string
): Promise<string> {
  const hashtags = (post.hashtags as string[]).join(" ");
  const text = `${post.copyText}\n\n${hashtags}`.trim();
  const mediaUrls = post.mediaUrls as string[];

  const body: Record<string, unknown> = {
    author: `urn:li:organization:${connection.platformAccountId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: mediaUrls.length > 0 ? "IMAGE" : "NONE",
        ...(mediaUrls.length > 0 && {
          media: mediaUrls.slice(0, 1).map((url) => ({
            status: "READY",
            media: url,
          })),
        }),
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const res = await fetch(`${API}/ugcPosts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`LinkedIn publish failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.id;
}
