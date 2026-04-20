import { create } from "zustand";
import type { Platform } from "@prisma/client";
import type { WizardBriefData, KeyDate, CTA } from "@/types";
import { nanoid } from "nanoid";

// We'll use a simple id generator since nanoid may not be installed
function genId() {
  return Math.random().toString(36).slice(2, 9);
}

interface WizardState {
  campaignId: string | null;
  brandId: string | null;
  currentStep: number;
  brief: WizardBriefData;
  setCampaignId: (id: string) => void;
  setBrandId: (id: string) => void;
  setStep: (step: number) => void;
  updateBrief: (data: Partial<WizardBriefData>) => void;
  addKeyDate: (date: string, label: string) => void;
  removeKeyDate: (id: string) => void;
  addCTA: (label: string, url: string) => void;
  removeCTA: (id: string) => void;
  addMediaAsset: (url: string, type: string, label: string) => void;
  removeMediaAsset: (id: string) => void;
  reset: () => void;
}

const defaultBrief: WizardBriefData = {
  name: "Monthly Social Media Calendar",
  platforms: [],
  keyDates: [],
  newProducts: [],
  staffHighlights: [],
  blogPosts: [],
  promos: [],
  companyUpdates: [],
  hashtags: [],
  ctas: [],
  destinationUrls: [],
  mediaAssets: [],
  postsPerPlatform: 4,
};

export const useWizardStore = create<WizardState>((set) => ({
  campaignId: null,
  brandId: null,
  currentStep: 1,
  brief: { ...defaultBrief },

  setCampaignId: (id) => set({ campaignId: id }),
  setBrandId: (id) => set({ brandId: id }),
  setStep: (step) => set({ currentStep: step }),

  updateBrief: (data) =>
    set((state) => ({ brief: { ...state.brief, ...data } })),

  addKeyDate: (date, label) =>
    set((state) => ({
      brief: {
        ...state.brief,
        keyDates: [...state.brief.keyDates, { id: genId(), date, label }],
      },
    })),

  removeKeyDate: (id) =>
    set((state) => ({
      brief: {
        ...state.brief,
        keyDates: state.brief.keyDates.filter((d) => d.id !== id),
      },
    })),

  addCTA: (label, url) =>
    set((state) => ({
      brief: {
        ...state.brief,
        ctas: [...state.brief.ctas, { id: genId(), label, url }],
      },
    })),

  removeCTA: (id) =>
    set((state) => ({
      brief: {
        ...state.brief,
        ctas: state.brief.ctas.filter((c) => c.id !== id),
      },
    })),

  addMediaAsset: (url, type, label) =>
    set((state) => ({
      brief: {
        ...state.brief,
        mediaAssets: [...state.brief.mediaAssets, { id: genId(), url, type, label }],
      },
    })),

  removeMediaAsset: (id) =>
    set((state) => ({
      brief: {
        ...state.brief,
        mediaAssets: state.brief.mediaAssets.filter((a) => a.id !== id),
      },
    })),

  reset: () => set({ campaignId: null, brandId: null, currentStep: 1, brief: { ...defaultBrief } }),
}));
