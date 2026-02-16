import { createBrowserClient } from "@supabase/ssr";

type RuntimeEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
};

function getRuntimeEnv(): RuntimeEnv | null {
  if (typeof window === "undefined") {
    return null;
  }

  const env = (window as typeof window & { __ENV__?: RuntimeEnv }).__ENV__;
  return env ?? null;
}

export function createClient() {
  const runtimeEnv = getRuntimeEnv();
  const fallbackEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };

  const supabaseUrl =
    runtimeEnv?.NEXT_PUBLIC_SUPABASE_URL ?? fallbackEnv.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    runtimeEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    fallbackEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing runtime Supabase env. Pass values via docker run -e.");
  }

  // Create a supabase client on the browser with runtime credentials.
  return createBrowserClient(supabaseUrl, supabaseKey);
}