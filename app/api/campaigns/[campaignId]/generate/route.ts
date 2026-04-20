import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, GENERATION_MODEL } from "@/lib/claude";
import { buildGenerationPrompt, type BriefData } from "@/lib/prompts/generate-posts";
import type { Platform, PostType } from "@prisma/client";

export const maxDuration = 60;

export async function POST(req: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = (session as { accountId?: string }).accountId!;
  const { campaignId } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, brand: { accountId } },
    include: { brand: true },
  });

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const brief = campaign.briefData as unknown as BriefData;
  if (!brief.platforms || brief.platforms.length === 0) {
    return NextResponse.json({ error: "No platforms selected" }, { status: 400 });
  }

  // Mark as generating
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "GENERATING" },
  });

  // Create a streaming response
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send({ type: "start", message: "Generating your content..." });

        const prompt = buildGenerationPrompt(campaign.brand, brief);

        let fullText = "";
        const claudeStream = await anthropic.messages.create({
          model: GENERATION_MODEL,
          max_tokens: 8000,
          stream: true,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const event of claudeStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            fullText += event.delta.text;
            send({ type: "progress", text: event.delta.text });
          }
        }

        // Parse generated JSON
        const jsonMatch = fullText.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("Failed to parse generated content");

        const generatedPosts: {
          platform: Platform;
          postType: PostType;
          copyText: string;
          hashtags: string[];
          imagePrompt?: string;
          ctaLabel?: string;
          ctaUrl?: string;
          suggestedDate?: string;
        }[] = JSON.parse(jsonMatch[0]);

        // Delete old draft posts for this campaign
        await prisma.post.deleteMany({
          where: { campaignId, status: "DRAFT" },
        });

        // Create new posts
        const postData = generatedPosts.map((p) => ({
          campaignId,
          platform: p.platform,
          postType: p.postType ?? "SINGLE_IMAGE",
          copyText: p.copyText,
          hashtags: p.hashtags ?? [],
          imagePrompt: p.imagePrompt ?? null,
          ctaLabel: p.ctaLabel ?? null,
          ctaUrl: p.ctaUrl ?? null,
          scheduledAt: p.suggestedDate ? new Date(p.suggestedDate) : null,
        }));

        await prisma.post.createMany({ data: postData });

        // Update campaign status
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: "READY" },
        });

        send({ type: "complete", count: generatedPosts.length });
      } catch (err) {
        console.error("Generation error:", err);
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { status: "DRAFT" },
        });
        send({ type: "error", message: err instanceof Error ? err.message : "Generation failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
