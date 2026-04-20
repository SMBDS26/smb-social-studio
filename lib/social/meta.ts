import type { Post, SocialConnection } from "@prisma/client";

const GRAPH_API = "https://graph.facebook.com/v19.0";

export async function publishToMeta(
  post: Post,
  connection: SocialConnection,
  accessToken: string
): Promise<string> {
  const pageId = connection.platformAccountId;
  const mediaUrls = post.mediaUrls as string[];

  if (post.platform === "INSTAGRAM") {
    return publishToInstagram(post, pageId, accessToken, mediaUrls);
  }
  return publishToFacebook(post, pageId, accessToken, mediaUrls);
}

async function publishToFacebook(
  post: Post,
  pageId: string,
  accessToken: string,
  mediaUrls: string[]
): Promise<string> {
  const hashtags = (post.hashtags as string[]).join(" ");
  const message = `${post.copyText}\n\n${hashtags}`.trim();

  const body: Record<string, string> = {
    message,
    access_token: accessToken,
  };

  if (mediaUrls.length > 0) {
    body.link = mediaUrls[0];
  }

  const res = await fetch(`${GRAPH_API}/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Facebook publish failed: ${err.error?.message ?? res.statusText}`);
  }

  const data = await res.json();
  return data.id;
}

async function publishToInstagram(
  post: Post,
  igAccountId: string,
  accessToken: string,
  mediaUrls: string[]
): Promise<string> {
  const hashtags = (post.hashtags as string[]).join(" ");
  const caption = `${post.copyText}\n\n${hashtags}`.trim();

  // Step 1: Create media container
  const containerParams: Record<string, string> = {
    caption,
    access_token: accessToken,
  };

  if (mediaUrls.length > 0) {
    containerParams.image_url = mediaUrls[0];
  } else {
    throw new Error("Instagram posts require at least one image");
  }

  const containerRes = await fetch(`${GRAPH_API}/${igAccountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(containerParams),
  });

  if (!containerRes.ok) {
    const err = await containerRes.json();
    throw new Error(`Instagram container creation failed: ${err.error?.message}`);
  }

  const { id: containerId } = await containerRes.json();

  // Step 2: Publish the container
  const publishRes = await fetch(`${GRAPH_API}/${igAccountId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: containerId, access_token: accessToken }),
  });

  if (!publishRes.ok) {
    const err = await publishRes.json();
    throw new Error(`Instagram publish failed: ${err.error?.message}`);
  }

  const { id } = await publishRes.json();
  return id;
}

export async function getMetaPages(accessToken: string) {
  const res = await fetch(
    `${GRAPH_API}/me/accounts?fields=id,name,picture,instagram_business_account&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error("Failed to fetch Meta pages");
  return res.json();
}
