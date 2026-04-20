import type {
  Brand,
  Campaign,
  Post,
  SocialConnection,
  Platform,
  PostStatus,
  CampaignStatus,
  BrandTone,
} from "@prisma/client";

export type { Brand, Campaign, Post, SocialConnection, Platform, PostStatus, CampaignStatus, BrandTone };

export interface BrandWithConnections extends Brand {
  connections: SocialConnection[];
  _count?: { campaigns: number };
}

export interface CampaignWithPosts extends Campaign {
  posts: Post[];
  brand: Brand;
}

export interface PostWithConnection extends Post {
  socialConnection?: SocialConnection | null;
}

export interface TargetAudience {
  id: string;
  label: string;
  notes?: string;
}

export interface KeyDate {
  id: string;
  date: string;
  label: string;
}

export interface CTA {
  id: string;
  label: string;
  url: string;
}

export interface WizardBriefData {
  name: string;
  platforms: Platform[];
  keyDates: KeyDate[];
  newProducts: string[];
  staffHighlights: string[];
  blogPosts: string[];
  promos: string[];
  companyUpdates: string[];
  hashtags: string[];
  ctas: CTA[];
  destinationUrls: string[];
  mediaAssets: { url: string; type: string; label: string; id: string }[];
  postsPerPlatform: number;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  TWITTER: "X (Twitter)",
  TIKTOK: "TikTok",
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  INSTAGRAM: "#E1306C",
  FACEBOOK: "#1877F2",
  LINKEDIN: "#0A66C2",
  TWITTER: "#000000",
  TIKTOK: "#010101",
};

export const TONE_LABELS: Record<BrandTone, string> = {
  PROFESSIONAL: "Professional",
  FRIENDLY: "Friendly",
  BOLD: "Bold",
  PLAYFUL: "Playful",
  AUTHORITATIVE: "Authoritative",
  CASUAL: "Casual",
  INSPIRATIONAL: "Inspirational",
};

export const TONE_DESCRIPTIONS: Record<BrandTone, string> = {
  PROFESSIONAL: "Polished and authoritative",
  FRIENDLY: "Warm and conversational",
  BOLD: "Direct and punchy",
  PLAYFUL: "Fun and witty",
  AUTHORITATIVE: "Expert and data-driven",
  CASUAL: "Relaxed and everyday",
  INSPIRATIONAL: "Uplifting and motivational",
};

export const INDUSTRIES = [
  "Accounting & Finance",
  "Architecture & Interior Design",
  "Beauty & Wellness",
  "Construction & Trades",
  "Consulting & Coaching",
  "E-commerce & Retail",
  "Education & Training",
  "Events & Entertainment",
  "Food & Hospitality",
  "Healthcare & Medical",
  "Legal Services",
  "Manufacturing",
  "Marketing & Advertising",
  "Non-profit & Charity",
  "Photography & Videography",
  "Property & Real Estate",
  "Recruitment & HR",
  "Technology & Software",
  "Travel & Tourism",
  "Other",
];
