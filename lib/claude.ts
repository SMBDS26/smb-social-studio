import Anthropic from "@anthropic-ai/sdk";

export const GENERATION_MODEL = "claude-sonnet-4-5";

let _anthropic: Anthropic | null = null;

export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop) {
    if (!_anthropic) {
      _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return _anthropic[prop as keyof Anthropic];
  },
});
