"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const presets = [
  "#7C3AED", "#2563EB", "#0891B2", "#059669",
  "#D97706", "#DC2626", "#DB2777", "#7C3AED",
  "#1F2937", "#374151",
];

export function BrandColorPicker({ label, value, onChange }: Props) {
  const [inputValue, setInputValue] = useState(value);

  const handleInput = (v: string) => {
    setInputValue(v);
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
  };

  return (
    <div className="flex-1 space-y-2">
      <Label className="text-sm text-gray-600">{label}</Label>

      {/* Colour preview + hex input */}
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-lg border border-gray-200 flex-shrink-0 cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => { setInputValue(e.target.value); onChange(e.target.value); }}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
        <Input
          value={inputValue}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="#7C3AED"
          className="font-mono text-sm"
          maxLength={7}
        />
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => { setInputValue(preset); onChange(preset); }}
            className="w-6 h-6 rounded-md border-2 transition-all"
            style={{
              backgroundColor: preset,
              borderColor: value === preset ? "white" : "transparent",
              outline: value === preset ? "2px solid #7C3AED" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
