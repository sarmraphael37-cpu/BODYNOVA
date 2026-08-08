import { NextRequest } from "next/server";
import { getUser } from "@/lib/dal/auth";
import { downloadAttachment } from "@/features/ai-coach/services/files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serves a stored AI Coach attachment back to the authenticated owner so
 * images/documents stay private (never public bucket links). Paths are
 * namespaced under the user id, which we enforce here.
 */
export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path");
  if (!path) {
    return Response.json({ error: "Missing path." }, { status: 400 });
  }

  if (!path.startsWith(`${user.id}/`) || path.includes("..")) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const { bytes, mime } = await downloadAttachment(path);
    return new Response(new Blob([bytes], { type: mime || "application/octet-stream" }), {
      headers: {
        "Content-Type": mime || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json({ error: "Attachment not found." }, { status: 404 });
  }
}
