import { supabase } from "@/integrations/supabase/client";

export type AIProvider = "openai";
export type AIInvocationStatus =
  | "pending"
  | "completed"
  | "error"
  | "unconfigured";

export interface AIInvocationPayload {
  provider: AIProvider;
  model: string;
  module: string;
  subtool: string;
  promptVersion: string;
  requestPayload: Record<string, unknown>;
}

export interface AIInvocationLog {
  provider: AIProvider;
  model: string;
  promptVersion: string;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown> | null;
  status: AIInvocationStatus;
  error: string | null;
  createdAt: string;
}

export interface AIInvocationResult {
  outputText: string;
  log: AIInvocationLog;
}

export async function invokeAIGeneration(
  payload: AIInvocationPayload,
): Promise<AIInvocationResult> {
  const createdAt = new Date().toISOString();

  const { data, error } = await supabase.functions.invoke("ai-generate", {
    body: payload,
  });

  if (error) {
    return {
      outputText: "",
      log: {
        provider: payload.provider,
        model: payload.model,
        promptVersion: payload.promptVersion,
        requestPayload: payload.requestPayload,
        responsePayload: null,
        status: "error",
        error: error.message,
        createdAt,
      },
    };
  }

  return {
    outputText: data?.outputText ?? "",
    log: {
      provider: payload.provider,
      model: payload.model,
      promptVersion: payload.promptVersion,
      requestPayload: payload.requestPayload,
      responsePayload: data ?? null,
      status: data?.status ?? "completed",
      error: data?.error ?? null,
      createdAt,
    },
  };
}
