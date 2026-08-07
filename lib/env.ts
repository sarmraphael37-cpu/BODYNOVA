const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseConfig() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment."
    );
  }
  return {
    url: supabaseUrl as string,
    anonKey: supabaseAnonKey as string,
  };
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

type BrevoConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName: string;
};

export function isBrevoConfigured(): boolean {
  return Boolean(
    process.env.BREVO_SMTP_HOST &&
      process.env.BREVO_SMTP_USER &&
      process.env.BREVO_SMTP_KEY &&
      process.env.BREVO_SMTP_FROM
  );
}

export function getBrevoConfig(): BrevoConfig {
  if (!isBrevoConfigured()) {
    throw new Error(
      "Brevo SMTP is not configured. Add BREVO_SMTP_HOST, BREVO_SMTP_USER, BREVO_SMTP_KEY, and BREVO_SMTP_FROM to your environment."
    );
  }
  return {
    host: process.env.BREVO_SMTP_HOST as string,
    port: Number(process.env.BREVO_SMTP_PORT ?? 587),
    user: process.env.BREVO_SMTP_USER as string,
    pass: process.env.BREVO_SMTP_KEY as string,
    from: process.env.BREVO_SMTP_FROM as string,
    fromName: process.env.BREVO_SMTP_FROM_NAME ?? "BodyNova",
  };
}

export type AiProviderName = "openai" | "openai-compatible";

export type AiConfig = {
  provider: AiProviderName;
  apiKey: string;
  baseUrl: string;
  model: string;
};

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.AI_API_KEY);
}

export function getAiConfig(): AiConfig {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI Coach is not configured. Add OPENAI_API_KEY or AI_API_KEY to your environment."
    );
  }

  const provider = (process.env.AI_COACH_PROVIDER ?? "openai") as AiProviderName;
  const baseUrl =
    process.env.AI_API_BASE_URL ?? "https://api.openai.com/v1";

  return {
    provider,
    apiKey,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    model: process.env.AI_MODEL ?? "gpt-4o-mini",
  };
}
