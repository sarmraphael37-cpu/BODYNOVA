"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Check,
  Copy,
  FileText,
  Loader2,
  MessageSquare,
  Mic,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/features/ai-coach/components/markdown";
import { relativeTime } from "@/utils/dates";
import type { AiMessage } from "@/types/database";
import type { ConversationListItem } from "@/features/ai-coach/services/conversations";
import type { ChatAttachment } from "@/features/ai-coach/schemas";
import {
  getConversationsAction,
  getMessagesAction,
  deleteConversationAction,
  clearConversationAction,
} from "@/features/ai-coach/actions";

const MAX_ATTACHMENTS = 4;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_TEXT_BYTES = 1024 * 1024;
const MAX_RECORD_SECONDS = 60;
const ACCEPTED_TYPES =
  "image/jpeg,image/png,image/webp,image/gif,text/plain,text/markdown,text/csv,application/json,text/xml";

const SUGGESTED_PROMPTS = [
  "How am I doing this week?",
  "What should I focus on today?",
  "Analyze my progress.",
  "Create a workout for me.",
  "Why hasn't my weight changed?",
  "How is my sleep affecting my routine?",
];

type QuickAction = { id: string; label: string; href: string };

function readActions(metadata: AiMessage["metadata"]): QuickAction[] {
  if (!metadata || !Array.isArray(metadata.actions)) return [];
  return metadata.actions.filter(
    (a): a is QuickAction =>
      typeof a === "object" &&
      a !== null &&
      typeof (a as QuickAction).label === "string" &&
      typeof (a as QuickAction).href === "string"
  );
}

type StreamEvent =
  | { type: "meta"; conversationId: string }
  | { type: "delta"; delta: string }
  | { type: "error"; error: string }
  | { type: "done" };

async function streamChat(
  message: string,
  conversationId: string | undefined,
  attachments: ChatAttachment[],
  handlers: {
    onMeta: (id: string) => void;
    onDelta: (delta: string) => void;
    onError: (error: string) => void;
    onDone: () => void;
  }
): Promise<void> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversationId, attachments }),
  });

  if (!response.ok || !response.body) {
    const body = await response.json().catch(() => null);
    handlers.onError(body?.error ?? "The AI Coach is unavailable right now.");
    handlers.onDone();
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      const line = frame.trim();
      if (!line.startsWith("data:")) continue;
      try {
        const event = JSON.parse(line.slice(5).trim()) as StreamEvent;
        if (event.type === "meta") handlers.onMeta(event.conversationId);
        else if (event.type === "delta") handlers.onDelta(event.delta);
        else if (event.type === "error") handlers.onError(event.error);
        else if (event.type === "done") handlers.onDone();
      } catch {
        // Ignore malformed frames.
      }
    }
  }
}

function makeLocalMessage(role: "user" | "assistant", content: string): AiMessage {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    conversation_id: "",
    user_id: "",
    role,
    content,
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1" aria-label="Nova is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  );
}

export function AiCoachClient({
  initialConversations,
  initialMessages,
  initialConversationId,
}: {
  initialConversations: ConversationListItem[];
  initialMessages: AiMessage[];
  initialConversationId?: string;
}) {
  const [conversations, setConversations] = React.useState(initialConversations);
  const [activeId, setActiveId] = React.useState<string | undefined>(initialConversationId);
  const [messages, setMessages] = React.useState<AiMessage[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [attachments, setAttachments] = React.useState<ChatAttachment[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [streaming, setStreaming] = React.useState(false);
  const [streamingText, setStreamingText] = React.useState("");
  const [recording, setRecording] = React.useState(false);
  const [transcribing, setTranscribing] = React.useState(false);
  const [recordSeconds, setRecordSeconds] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const activeIdRef = React.useRef(activeId);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const mediaChunksRef = React.useRef<Blob[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const recordTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const recordSecondsRef = React.useRef(0);

  React.useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  const refreshConversations = React.useCallback(async (preferId?: string) => {
    const list = await getConversationsAction();
    setConversations(list);
    const target = preferId ?? activeIdRef.current ?? list[0]?.id;
    if (target) {
      setActiveId(target);
      const msgs = await getMessagesAction(target);
      setMessages(msgs);
    } else {
      setActiveId(undefined);
      setMessages([]);
    }
  }, []);

  const selectConversation = React.useCallback(
    async (id: string) => {
      if (streaming) return;
      setActiveId(id);
      setShowSidebar(false);
      const msgs = await getMessagesAction(id);
      setMessages(msgs);
    },
    [streaming]
  );

  const handleFiles = React.useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (uploading || streaming) return;

      const next = [...attachments];
      for (const file of Array.from(files)) {
        const isImage = file.type.startsWith("image/");
        const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_TEXT_BYTES;
        if (file.size > maxBytes) {
          toast.error(`${file.name} is too large (${isImage ? "4 MB" : "1 MB"} max).`);
          continue;
        }
        if (next.length >= MAX_ATTACHMENTS) {
          toast.error(`You can attach up to ${MAX_ATTACHMENTS} files per message.`);
          break;
        }

        setUploading(true);
        try {
          const form = new FormData();
          form.append("file", file);
          const response = await fetch("/api/ai/upload", {
            method: "POST",
            body: form,
          });
          const body = (await response.json().catch(() => null)) as {
            attachment?: ChatAttachment;
            error?: string;
          } | null;
          if (!response.ok || !body?.attachment) {
            toast.error(body?.error ?? "Upload failed.");
            continue;
          }
          next.push(body.attachment);
        } catch {
          toast.error("Upload failed. Please try again.");
        } finally {
          setUploading(false);
        }
      }
      setAttachments(next);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [attachments, uploading, streaming]
  );

  const removeAttachment = React.useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const send = React.useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if ((!text && attachments.length === 0) || streaming || uploading) return;

      setInput("");
      const sentAttachments = attachments;
      setAttachments([]);
      setMessages((prev) => [...prev, makeLocalMessage("user", text)]);
      setStreaming(true);
      setStreamingText("");

      const conversationId = activeIdRef.current;

      const handleError = (error: string) => {
        toast.error(error);
      };

      await streamChat(text, conversationId, sentAttachments, {
        onMeta: (id) => {
          activeIdRef.current = id;
        },
        onDelta: (delta) => setStreamingText((prev) => prev + delta),
        onError: handleError,
        onDone: async () => {
          setStreaming(false);
          setStreamingText("");
          await refreshConversations(activeIdRef.current);
        },
      });
    },
    [input, attachments, streaming, uploading, refreshConversations]
  );

  const cleanupRecording = React.useCallback(() => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    mediaChunksRef.current = [];
    recordSecondsRef.current = 0;
    setRecording(false);
    setRecordSeconds(0);
  }, []);

  const stopAndTranscribe = React.useCallback(async () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    const stream = streamRef.current;
    mediaRecorderRef.current = null;
    streamRef.current = null;
    recordSecondsRef.current = 0;
    setRecording(false);
    setRecordSeconds(0);
    stream?.getTracks().forEach((track) => track.stop());

    if (!recorder || recorder.state === "inactive") {
      mediaChunksRef.current = [];
      return;
    }

    const chunks = mediaChunksRef.current;
    mediaChunksRef.current = [];
    const mimeType = recorder.mimeType || "audio/webm";
    const blob = new Blob(chunks, { type: mimeType });
    setTranscribing(true);

    try {
      const form = new FormData();
      form.append(
        "file",
        blob,
        `voice-${Date.now()}.${mimeType.includes("mp4") ? "m4a" : "webm"}`
      );
      const response = await fetch("/api/ai/transcribe", {
        method: "POST",
        body: form,
      });
      const body = (await response.json().catch(() => null)) as {
        text?: string;
        error?: string;
      } | null;
      if (!response.ok || !body?.text) {
        toast.error(body?.error ?? "Transcription failed.");
        return;
      }
      await send(body.text);
    } catch {
      toast.error("Transcription failed. Please try again.");
    } finally {
      setTranscribing(false);
    }
  }, [send]);

  const startRecording = React.useCallback(async () => {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      toast.error("Voice recording isn't supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      mediaChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) mediaChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        cleanupRecording();
        toast.error("Recording failed. Please try again.");
      };
      recorder.start();
      setRecording(true);
      setRecordSeconds(0);
      recordSecondsRef.current = 0;
      recordTimerRef.current = setInterval(() => {
        recordSecondsRef.current += 1;
        setRecordSeconds(recordSecondsRef.current);
        if (recordSecondsRef.current >= MAX_RECORD_SECONDS) {
          stopAndTranscribe();
        }
      }, 1000);
    } catch {
      toast.error("Microphone access was denied. Enable it in your browser settings.");
    }
  }, [cleanupRecording, stopAndTranscribe]);

  React.useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const regenerate = React.useCallback(
    async (messageIndex: number) => {
      if (streaming) return;
      let lastUserIndex = -1;
      for (let i = messageIndex - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          lastUserIndex = i;
          break;
        }
      }
      if (lastUserIndex === -1) return;
      await send(messages[lastUserIndex].content);
    },
    [messages, send, streaming]
  );

  const copyMessage = React.useCallback(async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      toast.error("Couldn't copy the message.");
    }
  }, []);

  const handleDeleteConversation = React.useCallback(
    async (id: string) => {
      await deleteConversationAction(id);
      if (activeIdRef.current === id) {
        activeIdRef.current = undefined;
        await refreshConversations();
      } else {
        await refreshConversations(activeIdRef.current);
      }
    },
    [refreshConversations]
  );

  const handleClear = React.useCallback(async () => {
    if (!activeIdRef.current) return;
    await clearConversationAction(activeIdRef.current);
    setMessages([]);
    toast.success("Conversation cleared.");
  }, []);

  const handleNewConversation = React.useCallback(() => {
    activeIdRef.current = undefined;
    setActiveId(undefined);
    setMessages([]);
    setShowSidebar(false);
    inputRef.current?.focus();
  }, []);

  const filtered = React.useMemo(
    () =>
      conversations.filter((c) =>
        c.title.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [conversations, search]
  );

  const showEmptyState = messages.length === 0 && !streaming;

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Conversation sidebar */}
      <aside className="grid gap-3 lg:sticky lg:top-6 lg:self-start">
        <div className="flex gap-2 lg:hidden">
          <Button className="flex-1" onClick={handleNewConversation}>
            <Plus className="h-4 w-4" aria-hidden />
            New conversation
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSidebar((v) => !v)}
            aria-expanded={showSidebar}
          >
            <MessageSquare className="h-4 w-4" aria-hidden />
            {conversations.length > 0 ? `(${conversations.length})` : ""}
          </Button>
        </div>

        <div className={cn("grid gap-3", showSidebar ? "grid" : "hidden lg:grid")}>
          <Button className="hidden w-full lg:inline-flex" onClick={handleNewConversation}>
            <Plus className="h-4 w-4" aria-hidden />
            New conversation
          </Button>

          <div className="rounded-xl border bg-card shadow-sm">
            <div className="relative p-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="h-9 w-full rounded-lg border border-transparent bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-input"
                aria-label="Search conversations"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2 lg:max-h-[440px]">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                  {search ? "No conversations match your search." : "No conversations yet."}
                </p>
              ) : (
                <ul className="space-y-1">
                  {filtered.map((conversation) => {
                    const active = conversation.id === activeId;
                    return (
                      <li key={conversation.id}>
                        <div
                          className={cn(
                            "group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors",
                            active ? "bg-primary/10" : "hover:bg-accent"
                          )}
                          onClick={() => selectConversation(conversation.id)}
                        >
                          <MessageSquare
                            className={cn("h-3.5 w-3.5 shrink-0", active ? "text-primary" : "text-muted-foreground")}
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <p className={cn("truncate text-sm font-medium", active && "text-primary")}>
                              {conversation.title}
                            </p>
                            {conversation.preview && (
                              <p className="truncate text-xs text-muted-foreground">
                                {conversation.preview}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conversation.id);
                            }}
                            className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus:opacity-100 group-hover:opacity-100"
                            aria-label={`Delete ${conversation.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Chat panel */}
      <Card className="flex min-h-[480px] flex-col sm:min-h-[560px]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand">
              <Brain className="h-4.5 w-4.5 text-primary-foreground" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Ask your coach</h2>
              <p className="text-xs text-muted-foreground">
                AI-generated guidance based on your recorded fitness data.
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button size="sm" variant="ghost" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>

        <div className="max-h-[55vh] flex-1 space-y-4 overflow-y-auto p-4 lg:max-h-[520px]">
          {showEmptyState ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 py-6">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand">
                  <Brain className="h-6 w-6 text-primary-foreground" aria-hidden />
                </div>
                <h3 className="text-base font-semibold">Start a conversation</h3>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Ask about your progress, get a workout, understand your trends, log entries
                  with plain language, or attach a photo, meal screenshot, or document for
                  analysis.
                </p>
              </div>

              <div className="w-full max-w-lg">
                <p className="mb-2 flex items-center justify-center gap-1.5 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Suggested questions
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => send(prompt)}
                      className="group flex items-start gap-2 rounded-xl border bg-card px-3.5 py-3 text-left text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
                      <span className="leading-snug">{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                const actions = isUser ? [] : readActions(message.metadata);
                return (
                  <div
                    key={message.id}
                    className={cn("flex flex-col", isUser ? "items-end" : "items-start")}
                  >
                    <div className={cn("flex w-full gap-3", isUser && "justify-end")}>
                      {!isUser && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand">
                          <Brain className="h-4 w-4 text-primary-foreground" aria-hidden />
                        </div>
                      )}
                      <div
                        className={cn(
                          "group relative max-w-[85%] space-y-1 rounded-2xl px-4 py-3 sm:max-w-[75%]",
                          isUser
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm border bg-card"
                        )}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        ) : (
                          <Markdown content={message.content} />
                        )}
                        <div
                          className={cn(
                            "flex items-center gap-2 text-[10px]",
                            isUser ? "justify-end text-primary-foreground/70" : "text-muted-foreground"
                          )}
                        >
                          <span>{relativeTime(message.created_at)}</span>
                          <button
                            type="button"
                            onClick={() => copyMessage(message.id, message.content)}
                            className="opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
                            aria-label="Copy message"
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3 w-3" aria-hidden />
                            ) : (
                              <Copy className="h-3 w-3" aria-hidden />
                            )}
                          </button>
                          {!isUser && (
                            <button
                              type="button"
                              onClick={() => regenerate(index)}
                              disabled={streaming}
                              className="opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 disabled:opacity-40 group-hover:opacity-100"
                              aria-label="Regenerate response"
                            >
                              <RefreshCw className="h-3 w-3" aria-hidden />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {actions.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5 pl-11">
                        {actions.map((action) => (
                          <Link
                            key={action.id}
                            href={action.href}
                            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 hover:underline-offset-2"
                          >
                            {action.label}
                            <ArrowRight className="h-3 w-3" aria-hidden />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {streaming && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand">
                    <Brain className="h-4 w-4 text-primary-foreground" aria-hidden />
                  </div>
                  <div className="max-w-[85%] space-y-1 rounded-2xl rounded-bl-sm border bg-card px-4 py-3 sm:max-w-[75%]">
                    {streamingText ? (
                      <Markdown content={streamingText} />
                    ) : (
                      <TypingDots />
                    )}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="border-t p-3">
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="group/att flex items-center gap-2 rounded-lg border bg-muted/40 py-1.5 pl-1.5 pr-1"
                  >
                    {attachment.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/ai/files?path=${encodeURIComponent(attachment.path)}`}
                        alt={attachment.name}
                        className="h-8 w-8 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" aria-hidden />
                      </div>
                    )}
                    <span className="max-w-[160px] truncate text-xs text-muted-foreground">
                      {attachment.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${attachment.name}`}
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              {recording && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                  </span>
                  Recording… {recordSeconds}s
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                aria-hidden
                tabIndex={-1}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={cn(
                  "h-[60px] w-[52px] shrink-0",
                  recording ? "text-destructive" : "text-muted-foreground"
                )}
                onClick={() =>
                  recording ? stopAndTranscribe() : startRecording()
                }
                disabled={
                  streaming ||
                  uploading ||
                  transcribing ||
                  attachments.length > 0 ||
                  input.trim().length > 0
                }
                aria-label={recording ? "Stop recording" : "Record a voice message"}
                title={recording ? "Stop recording" : "Record a voice message"}
              >
                {transcribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : recording ? (
                  <Square className="h-4 w-4" aria-hidden />
                ) : (
                  <Mic className="h-4 w-4" aria-hidden />
                )}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-[60px] w-[52px] shrink-0 text-muted-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  streaming ||
                  uploading ||
                  transcribing ||
                  recording ||
                  attachments.length >= MAX_ATTACHMENTS
                }
                aria-label="Attach a file"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Paperclip className="h-4 w-4" aria-hidden />
                )}
              </Button>
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask anything — speak, attach a photo or doc, or type a message"
                className="min-h-[60px] max-h-32 flex-1 resize-none"
                rows={2}
                disabled={streaming || uploading || recording || transcribing}
                aria-label="Message your AI coach"
              />
              <Button
                type="submit"
                size="icon"
                className="h-[60px] w-[52px] shrink-0"
                disabled={
                  streaming ||
                  uploading ||
                  recording ||
                  transcribing ||
                  (!input.trim() && attachments.length === 0)
                }
                aria-label="Send message"
              >
                <Send className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Nova uses your recorded data only. Guidance is informational — not medical advice.
          </p>
        </div>
      </Card>
    </div>
  );
}
