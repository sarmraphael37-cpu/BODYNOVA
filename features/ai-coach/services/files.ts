import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AiContentPart } from "@/lib/ai/provider";
import type { ChatAttachment } from "@/features/ai-coach/schemas";

export const AI_COACH_BUCKET = "ai-coach";
export const MAX_ATTACHMENTS = 4;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const TEXT_MIME_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "text/xml",
]);

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_TEXT_BYTES = 1024 * 1024;
const MAX_TEXT_CHARS = 6000;

export type AttachmentKind = "image" | "text";

export function detectAttachmentKind(mime: string): AttachmentKind | null {
  if (mime in IMAGE_EXTENSIONS) return "image";
  if (TEXT_MIME_TYPES.has(mime)) return "text";
  return null;
}

function safeExtension(fileName: string, fallback: string): string {
  const match = fileName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = match ? match[1].toLowerCase() : fallback;
  return /^[a-z0-9]{1,8}$/.test(ext) ? `.${ext}` : `.${fallback}`;
}

async function ensureBucket(): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.storage.createBucket(AI_COACH_BUCKET, {
    public: false,
  });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error("Could not initialize file storage.");
  }
}

export async function uploadAttachment(input: {
  userId: string;
  file: File;
}): Promise<ChatAttachment> {
  const { userId, file } = input;

  const kind = detectAttachmentKind(file.type);
  if (!kind) {
    throw new Error(
      "Unsupported file type. Attach an image (JPG, PNG, WebP, GIF) or a text file (TXT, MD, CSV, JSON, XML)."
    );
  }
  if (file.size === 0) throw new Error("The file is empty.");

  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_TEXT_BYTES;
  if (file.size > maxBytes) {
    throw new Error(
      kind === "image"
        ? "Images must be 4 MB or smaller."
        : "Text files must be 1 MB or smaller."
    );
  }

  await ensureBucket();
  const admin = createAdminClient();

  const extension =
    kind === "image"
      ? IMAGE_EXTENSIONS[file.type]
      : safeExtension(file.name, "txt");
  const id = randomUUID();
  const path = `${userId}/${id}${extension}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await admin.storage
    .from(AI_COACH_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw new Error("Upload failed. Please try again.");

  return {
    id,
    name: file.name,
    mime: file.type,
    kind,
    size: file.size,
    path,
  };
}

export async function downloadAttachment(
  path: string
): Promise<{ bytes: ArrayBuffer; mime: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(AI_COACH_BUCKET)
    .download(path);
  if (error || !data) throw new Error("Attachment could not be read.");
  return {
    bytes: await data.arrayBuffer(),
    mime: data.type,
  };
}

export async function attachmentToContentParts(
  attachment: ChatAttachment
): Promise<AiContentPart[]> {
  const { bytes, mime } = await downloadAttachment(attachment.path);

  if (attachment.kind === "image") {
    const dataUrl = `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
    return [{ type: "image_url", image_url: { url: dataUrl } }];
  }

  const text = new TextDecoder().decode(bytes).slice(0, MAX_TEXT_CHARS);
  return [
    {
      type: "text",
      text:
        `--- Attached file: ${attachment.name} (${attachment.mime}) ---\n` +
        `${text}\n` +
        `--- End of file ${attachment.name} ---`,
    },
  ];
}
