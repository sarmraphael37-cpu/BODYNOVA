import { describe, it, expect } from "vitest";
import { extractJson, safeParseJson, chatResponseSchema, insightContentSchema } from "@/features/ai-coach/schemas";

describe("extractJson", () => {
  it("extracts JSON from markdown fences", () => {
    expect(extractJson('```json\n{"reply":"hi"}\n```')).toBe('{"reply":"hi"}');
    expect(extractJson('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("extracts the JSON object from surrounding text", () => {
    expect(extractJson('Here you go: {"reply":"hello"} thanks!')).toBe('{"reply":"hello"}');
  });

  it("returns cleaned input when no object found", () => {
    expect(extractJson("plain text")).toBe("plain text");
  });
});

describe("safeParseJson", () => {
  it("parses and validates valid payloads", () => {
    const result = safeParseJson(
      chatResponseSchema,
      '{"reply":"You look good","actions":[{"id":"dash","label":"Dashboard","href":"/app/dashboard"}]}'
    );
    expect(result?.reply).toBe("You look good");
  });

  it("applies default actions", () => {
    const result = safeParseJson(chatResponseSchema, '{"reply":"ok"}');
    expect(result?.actions).toEqual([]);
  });

  it("returns null for invalid payloads", () => {
    expect(safeParseJson(chatResponseSchema, '{"reply":""}')).toBeNull();
    expect(safeParseJson(chatResponseSchema, "not json")).toBeNull();
    expect(safeParseJson(chatResponseSchema, '{"reply":"ok","actions":[{"id":"a"}]}')).toBeNull();
  });

  it("validates insight content with defaults", () => {
    const result = safeParseJson(
      insightContentSchema,
      '{"type":"daily","title":"Hydrate","content":"Drink more.","priority":"high","confidence":"medium"}'
    );
    expect(result?.recommendations).toEqual([]);
    expect(result?.title).toBe("Hydrate");
  });
});
