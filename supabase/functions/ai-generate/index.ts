import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AIInvocationPayload {
  provider: "openai";
  model: string;
  module: string;
  subtool: string;
  promptVersion: string;
  requestPayload: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const createdAt = new Date().toISOString();

  try {
    const payload = (await req.json()) as AIInvocationPayload;
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          status: "unconfigured",
          error: "OPENAI_API_KEY is not configured",
          outputText: "",
          provider: payload.provider,
          model: payload.model,
          promptVersion: payload.promptVersion,
          requestPayload: payload.requestPayload,
          responsePayload: null,
          createdAt,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: payload.model,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: `OkeyGolf OS ${payload.module} / ${payload.subtool} 호출입니다. promptVersion=${payload.promptVersion}`,
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify(payload.requestPayload),
              },
            ],
          },
        ],
      }),
    });

    const responsePayload = await openAIResponse.json();
    const outputText = responsePayload?.output_text ?? "";

    if (!openAIResponse.ok) {
      return new Response(
        JSON.stringify({
          status: "error",
          error: responsePayload?.error?.message ?? "OpenAI request failed",
          outputText: "",
          provider: payload.provider,
          model: payload.model,
          promptVersion: payload.promptVersion,
          requestPayload: payload.requestPayload,
          responsePayload,
          createdAt,
        }),
        {
          status: openAIResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        status: "completed",
        error: null,
        outputText,
        provider: payload.provider,
        model: payload.model,
        promptVersion: payload.promptVersion,
        requestPayload: payload.requestPayload,
        responsePayload,
        createdAt,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        outputText: "",
        createdAt,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
