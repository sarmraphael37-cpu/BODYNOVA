import "server-only";

const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const TRANSCRIBE_MODEL = "whisper-large-v3-turbo";
const MAX_AUDIO_BYTES = 24 * 1024 * 1024;

const AUDIO_MIME_TYPES = new Set([
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/m4a",
  "audio/x-m4a",
  "audio/aac",
]);

const MIME_EXTENSION: Record<string, string> = {
  "audio/webm": "webm",
  "audio/webm;codecs=opus": "webm",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/m4a": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
};

export function isTranscriptionConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export class TranscriptionError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "TranscriptionError";
    this.status = status;
  }
}

/**
 * Transcribes a voice recording using Groq's Whisper API. Returns the plain
 * text so the caller can feed it straight into the normal chat flow.
 */
export async function transcribeAudio(input: { file: File }): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new TranscriptionError("Voice transcription is not configured.", 503);
  }

  const mime = input.file.type || "audio/webm";
  if (!AUDIO_MIME_TYPES.has(mime)) {
    throw new TranscriptionError("Unsupported audio format.", 415);
  }
  if (input.file.size === 0) {
    throw new TranscriptionError("The recording is empty.", 400);
  }
  if (input.file.size > MAX_AUDIO_BYTES) {
    throw new TranscriptionError("Recording is too long or too large.", 400);
  }

  const form = new FormData();
  form.append("file", input.file, `voice-${Date.now()}.${MIME_EXTENSION[mime] ?? "webm"}`);
  form.append("model", TRANSCRIBE_MODEL);
  form.append("response_format", "json");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(GROQ_TRANSCRIBE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new TranscriptionError("Transcription failed. Please try again.", 502);
    }

    const data = (await response.json()) as { text?: string };
    const text = (data.text ?? "").trim();
    if (!text) {
      throw new TranscriptionError("I couldn't hear anything — please try again.", 422);
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
}
