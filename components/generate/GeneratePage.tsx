"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Brand, Campaign } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

type GenerationStatus = "idle" | "generating" | "done" | "error";

interface GeneratePageProps {
  campaign: Campaign;
  brand: Brand;
}

export function GeneratePage({ campaign, brand }: GeneratePageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startGeneration();
  }, []);

  const startGeneration = async () => {
    setStatus("generating");
    setProgress(10);
    setMessages(["Analysing your brand profile..."]);

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/generate`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Generation failed to start");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "start") {
              setMessages((prev) => [...prev, data.message]);
              setProgress(20);
            } else if (data.type === "progress") {
              setProgress((prev) => Math.min(prev + 1, 90));
            } else if (data.type === "complete") {
              setProgress(100);
              setPostCount(data.count);
              setStatus("done");
              setMessages((prev) => [...prev, `✓ Created ${data.count} posts successfully!`]);
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
          } catch (parseError) {
            // Ignore JSON parse errors in streaming chunks
          }
        }
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Generation failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {status === "done" ? "Content ready!" : "Generating your content..."}
        </h1>
        <p className="text-gray-500 mt-1">
          {status === "done"
            ? `Created ${postCount} posts for ${brand.name}`
            : "AI is writing your posts. This takes about 20-30 seconds."}
        </p>
      </div>

      <Card>
        <CardContent className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex items-center justify-center">
            {status === "done" ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            ) : status === "error" ? (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center relative">
                <Sparkles className="w-10 h-10 text-violet-600 animate-pulse" />
              </div>
            )}
          </div>

          {/* Progress */}
          {status === "generating" && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500">{progress}% complete</p>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-1.5 text-left">
            {messages.map((msg, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{msg}</span>
              </div>
            ))}
            {status === "generating" && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded-full border-2 border-violet-600 border-t-transparent animate-spin flex-shrink-0" />
                <span className="text-gray-500">Writing your posts...</span>
              </div>
            )}
          </div>

          {/* Error */}
          {status === "error" && (
            <div className="space-y-3">
              <p className="text-sm text-red-600">{error}</p>
              <Button variant="outline" onClick={startGeneration}>Try again</Button>
            </div>
          )}

          {/* Done */}
          {status === "done" && (
            <Button
              className="w-full bg-violet-600 hover:bg-violet-700"
              onClick={() => router.push(`/create/${campaign.id}/preview`)}
            >
              Preview & edit posts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>

      {status === "generating" && (
        <p className="text-center text-xs text-gray-400">
          Creating platform-perfect content tailored to {brand.name}...
        </p>
      )}
    </div>
  );
}
