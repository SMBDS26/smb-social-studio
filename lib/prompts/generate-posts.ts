import type { Brand, BrandTone, Platform } from "@prisma/client";

export interface BriefData {
  name?: string;
  platforms: Platform[];
  keyDates?: { date: string; label: string }[];
  newProducts?: string[];
  staffHighlights?: string[];
  blogPosts?: string[];
  promos?: string[];
  companyUpdates?: string[];
  hashtags?: string[];
  ctas?: { label: string; url: string }[];
  destinationUrls?: string[];
  mediaAssets?: { url: string; type: string; label: string }[];
  postsPerPlatform?: number;
}

const toneDescriptions: Record<BrandTone, string> = {
  PROFESSIONAL: "professional and polished — authoritative but approachable, no slang",
  FRIENDLY: "warm, conversational, and personable — like talking to a trusted friend",
  BOLD: "direct, confident, and punchy — short sentences, strong verbs, no hedging",
  PLAYFUL: "fun, witty, and energetic — use humour where appropriate, emojis welcome",
  AUTHORITATIVE: "expert and credible — data-backed, industry-leading tone",
  CASUAL: "relaxed and everyday — conversational, informal, natural language",
  INSPIRATIONAL: "uplifting and motivational — focus on impact, aspiration, and transformation",
};

const platformRules: Record<Platform, string> = {
  INSTAGRAM: `- Max 2,200 characters but optimal is 138-150 chars for feed posts
- 3-5 hashtags in caption, or up to 30 in first comment
- Use emojis naturally to break up text
- Strong hook in first line (before "more" cut-off)
- No clickable links in caption — direct to bio link`,
  FACEBOOK: `- Max 63,206 characters but optimal 40-80 chars for highest engagement
- 1-2 hashtags maximum
- Can include links that generate previews
- Encourage comments/shares with a question
- Stories-style casual tone works well`,
  LINKEDIN: `- Max 3,000 characters; first 140 chars show before "see more"
- 3-5 relevant professional hashtags
- Line breaks every 1-2 sentences for readability
- No more than 1-2 emojis; keep professional
- Thought leadership angle, business value focus
- Tag relevant people/companies with @`,
  TWITTER: `- Max 280 characters (hard limit)
- 1-2 hashtags maximum — embedded in copy, not at end
- Punchy, shareable — think headlines
- Question or provocative statement drives engagement
- Thread format for longer stories (number tweets 1/n)`,
  TIKTOK: `- Caption max 2,200 characters but keep to 150 chars or less
- 3-5 trending/relevant hashtags
- Hook must be in first 1-3 seconds — reference it in caption
- Casual, authentic, trend-aware language
- Note: video content required; caption supports the video`,
};

export function buildGenerationPrompt(brand: Brand, brief: BriefData): string {
  const tone = toneDescriptions[brand.tone];
  const audiences = Array.isArray(brand.targetAudiences)
    ? (brand.targetAudiences as string[]).join(", ")
    : "general audience";

  const platformSections = brief.platforms
    .map((p) => `### ${p}\n${platformRules[p]}`)
    .join("\n\n");

  const postsPerPlatform = brief.postsPerPlatform ?? 4;

  const events = [
    ...(brief.keyDates?.map((d) => `Key date: ${d.label} on ${d.date}`) ?? []),
    ...(brief.newProducts?.map((p) => `New product/service: ${p}`) ?? []),
    ...(brief.staffHighlights?.map((s) => `Staff highlight: ${s}`) ?? []),
    ...(brief.blogPosts?.map((b) => `Blog post to promote: ${b}`) ?? []),
    ...(brief.promos?.map((p) => `Promotion: ${p}`) ?? []),
    ...(brief.companyUpdates?.map((u) => `Company update: ${u}`) ?? []),
  ].join("\n");

  const ctaSection =
    brief.ctas && brief.ctas.length > 0
      ? brief.ctas.map((c) => `- "${c.label}" → ${c.url}`).join("\n")
      : "- Use natural CTAs like 'Learn more', 'Get in touch', or 'Visit our website'";

  const hashtagHints =
    brief.hashtags && brief.hashtags.length > 0
      ? `Preferred hashtags to incorporate: ${brief.hashtags.join(" ")}`
      : "Generate relevant hashtags based on industry and content";

  return `You are an expert social media content creator. Create a complete monthly social media calendar for the following brand.

## Brand Profile
- **Business Name**: ${brand.name}
- **Industry**: ${brand.industry ?? "Not specified"}
- **Brand Tone**: ${tone}
- **Target Audiences**: ${audiences}
- **Business Summary**: ${brand.businessSummary ?? "Not provided"}
- **Website**: ${brand.websiteUrl ?? "Not provided"}

## Campaign Brief
${events || "Create a general brand awareness and engagement calendar with no specific events."}

## Call-to-Action Options
${ctaSection}

## Hashtag Guidance
${hashtagHints}

## Platform Rules
${platformSections}

## Task
Generate exactly ${postsPerPlatform} posts for EACH of these platforms: ${brief.platforms.join(", ")}.

Each post should be varied in content type (not all the same topic), cover different aspects of the business, and feel natural for that platform.

Return ONLY a valid JSON array (no markdown, no explanation) in this exact schema:

[
  {
    "platform": "INSTAGRAM",
    "postType": "SINGLE_IMAGE",
    "copyText": "Full post copy here...",
    "hashtags": ["#hashtag1", "#hashtag2"],
    "imagePrompt": "Detailed visual description for an image that would pair with this post",
    "ctaLabel": "Learn More",
    "ctaUrl": "${brand.websiteUrl ?? ""}",
    "suggestedDate": "2025-02-03"
  }
]

PostType options: SINGLE_IMAGE, CAROUSEL, VIDEO, TEXT_ONLY, STORY
Platforms must be exact enum values: ${brief.platforms.join(", ")}
suggestedDate should spread posts across the month evenly.
Generate a total of ${brief.platforms.length * postsPerPlatform} posts.`;
}
