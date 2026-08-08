import { NextRequest } from "next/server";
import { getUser } from "@/lib/dal/auth";
import {
  transcribeAudio,
  TranscriptionError,
} from "@/features/ai-coach/services/transcribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No audio file provided." }, { status: 400 });
  }

  try {
    const text = await transcribeAudio({ file });
    return Response.json({ text });
  } catch (error) {
    if (error instanceof TranscriptionError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json(
      { error: "Transcription failed. Please try again." },
      { status: 500 }
    );
  }
}
