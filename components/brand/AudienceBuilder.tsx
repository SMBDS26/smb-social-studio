"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface Audience {
  id: string;
  label: string;
  notes: string;
}

interface Props {
  value: Audience[];
  onChange: (audiences: Audience[]) => void;
}

const suggestions = [
  "Small business owners",
  "Local homeowners",
  "Young professionals (25-35)",
  "Parents with young children",
  "Brides & couples",
  "HR managers",
  "Health-conscious adults",
  "Local residents",
];

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

export function AudienceBuilder({ value, onChange }: Props) {
  const [inputValue, setInputValue] = useState("");

  const add = (label: string) => {
    if (!label.trim()) return;
    if (value.find((a) => a.label.toLowerCase() === label.toLowerCase())) return;
    onChange([...value, { id: genId(), label: label.trim(), notes: "" }]);
    setInputValue("");
  };

  const remove = (id: string) => {
    onChange(value.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="e.g. Small business owners in London"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(inputValue); }
          }}
        />
        <Button type="button" variant="outline" onClick={() => add(inputValue)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Added audiences */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((audience) => (
            <Badge key={audience.id} variant="secondary" className="gap-1 pr-1 py-1">
              {audience.label}
              <button
                type="button"
                onClick={() => remove(audience.id)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {value.length < 5 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter((s) => !value.find((a) => a.label === s))
              .slice(0, 6)
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors"
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
