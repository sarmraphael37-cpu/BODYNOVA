import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isAiConfigured, getAiConfig } from "@/lib/env";

const AI_ENV_KEYS = [
  "OPENAI_API_KEY",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "AI_API_KEY",
  "AI_COACH_PROVIDER",
  "AI_API_BASE_URL",
  "AI_MODEL",
];

beforeEach(() => {
  for (const key of AI_ENV_KEYS) delete process.env[key];
});

afterEach(() => {
  for (const key of AI_ENV_KEYS) delete process.env[key];
});

describe("AI provider detection", () => {
  it("returns not configured when no key is present", () => {
    expect(isAiConfigured()).toBe(false);
    expect(() => getAiConfig()).toThrow(/not configured/i);
  });

  it("detects GEMINI_API_KEY with its defaults", () => {
    process.env.GEMINI_API_KEY = "AIza-test";
    expect(isAiConfigured()).toBe(true);
    const config = getAiConfig();
    expect(config.provider).toBe("gemini");
    expect(config.apiKey).toBe("AIza-test");
    expect(config.baseUrl).toBe(
      "https://generativelanguage.googleapis.com/v1beta/openai"
    );
    expect(config.model).toBe("gemini-3.5-flash");
  });

  it("detects GROQ_API_KEY with its defaults", () => {
    process.env.GROQ_API_KEY = "gsk-test";
    expect(isAiConfigured()).toBe(true);
    const config = getAiConfig();
    expect(config.provider).toBe("groq");
    expect(config.apiKey).toBe("gsk-test");
    expect(config.baseUrl).toBe("https://api.groq.com/openai/v1");
    expect(config.model).toBe("llama-3.3-70b-versatile");
  });

  it("prioritizes OPENAI > GEMINI > GROQ > generic AI_API_KEY", () => {
    process.env.GROQ_API_KEY = "gsk";
    process.env.GEMINI_API_KEY = "AIza";
    expect(getAiConfig().provider).toBe("gemini");

    process.env.OPENAI_API_KEY = "sk";
    expect(getAiConfig().provider).toBe("openai");

    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    process.env.AI_API_KEY = "generic";
    expect(getAiConfig().provider).toBe("openai-compatible");
  });

  it("honors explicit AI_MODEL and AI_API_BASE_URL overrides", () => {
    process.env.GEMINI_API_KEY = "AIza";
    process.env.AI_MODEL = "gemini-2.0-flash";
    process.env.AI_API_BASE_URL = "https://example.com/v1/";
    const config = getAiConfig();
    expect(config.model).toBe("gemini-2.0-flash");
    expect(config.baseUrl).toBe("https://example.com/v1");
  });
});
