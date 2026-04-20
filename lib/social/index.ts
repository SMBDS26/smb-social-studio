import type { Post, SocialConnection } from "@prisma/client";
import { decrypt } from "@/lib/crypto";
import { publishToMeta } from "./meta";
import { publishToLinkedIn } from "./linkedin";
import { publishToTwitter } from "./twitter";
import { publishToTikTok } from "./tiktok";

export async function publishPost(
  post: Post,
  connection: SocialConnection
): Promise<string> {
  const accessToken = decrypt(connection.accessToken);
  const refreshToken = connection.refreshToken ? decrypt(connection.refreshToken) : null;

  switch (post.platform) {
    case "INSTAGRAM":
    case "FACEBOOK":
      return publishToMeta(post, connection, accessToken);
    case "LINKEDIN":
      return publishToLinkedIn(post, connection, accessToken);
    case "TWITTER":
      return publishToTwitter(post, connection, accessToken, refreshToken);
    case "TIKTOK":
      return publishToTikTok(post, connection, accessToken);
    default:
      throw new Error(`Unsupported platform: ${post.platform}`);
  }
}
