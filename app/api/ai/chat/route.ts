import { NextRequest } from "next/server";
import { getUser } from "@/lib/dal/auth";
import { startChat, ChatSetupError } from "@/features/ai-coach/services/chat";
import { chatInputSchema } from "@/features/ai-coach/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sse(response: Response): Response {
  response.headers.set("Content-Type", "text/event-stream; charset=utf-8");
  response.headers.set("Cache-Control", "no-cache, no-transform");
  response.headers.set("Connection", "keep-alive");
  response.headers.set("X-Accel-Buffering", "no");
  return response;
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = chatInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Message must be between 1 and 2000 characters." },
      { status: 400 }
    );
  }

  let conversationId: string;
  let stream: AsyncIterable<{ delta: string }>;
  try {
    ({ conversationId, stream } = await startChat({
      userId: user.id,
      message: parsed.data.message,
      conversationId: parsed.data.conversationId,
      signal: request.signal,
    }));
  } catch (error) {
    if (error instanceof ChatSetupError) {
      return Response.json({ error: error.message }, { status: 429 });
    }
    return Response.json(
      { error: "The AI Coach hit an unexpected error. Please try again." },
      { status: 500 }
    );
  }

  const encoder = new TextEncoder();
  const streamBody = new ReadableStream({
    async start(controller) {
      const write = (payload: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      try {
        write({ type: "meta", conversationId });
        for await (const chunk of stream) {
          if (chunk.delta) write({ type: "delta", delta: chunk.delta });
        }
        write({ type: "done" });
      } catch (error) {
        write({
          type: "error",
          error: error instanceof Error ? error.message : "Stream interrupted.",
        });
      } finally {
        controller.close();
      }
    },
    cancel() {
      // Client disconnected — the provider stream is aborted via the signal.
    },
  });

  return sse(new Response(streamBody));
}
