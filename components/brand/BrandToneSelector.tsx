"use client";

import { TONE_LABELS, TONE_DESCRIPTIONS } from "@/types";
import type { BrandTone } from "@prisma/client";
import { cn } from "@/lib/utils";

const toneExamples: Record<BrandTone, string> = {
  PROFESSIONAL: '"Delivering measurable results for your business."',
  FRIENDLY: '"Hey! We\'d love to help you grow. Let\'s chat!"',
  BOLD: '"Stop settling. Demand better. We deliver."',
  PLAYFUL: '"Plot twist: great marketing can actually be fun 🎉"',
  AUTHORITATIVE: '"Based on 10 years of industry data, here\'s what works."',
  CASUAL: '"So yeah, we make this stuff pretty easy, to be honest."',
  INSPIRATIONAL: '"Every business has the power to change someone\'s day."',
};

const tones = Object.keys(TONE_LABELS) as BrandTone[];

interface Props {
  value: BrandTone;
  onChange: (tone: BrandTone) => void;
}

export function BrandToneSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {tones.map((tone) => (
        <button
          key={tone}
          type="button"
          onClick={() => onChange(tone)}
          className={cn(
            "text-left p-3 rounded-lg border-2 transition-all",
            value === tone
              ? "border-violet-600 bg-violet-50"
              : "border-gray-200 hover:border-gray-300 bg-white"
          )}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm text-gray-900">{TONE_LABELS[tone]}</span>
            {value === tone && (
              <div className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">{TONE_DESCRIPTIONS[tone]}</p>
          <p className="text-xs text-gray-400 italic mt-1 line-clamp-1">{toneExamples[tone]}</p>
        </button>
      ))}
    </div>
  );
}
