import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
  LOVABLE_AIG_RUN_ID_HEADER,
} from "@/lib/ai-gateway.server";
import type { Database } from "@/integrations/supabase/types";

const DEMO_ORG_ID = "00000000-0000-4000-8000-000000000001";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const lovableApiKey = process.env.LOVABLE_API_KEY;
        if (!lovableApiKey) {
          return Response.json({ error: "AI is not configured" }, { status: 500 });
        }

        const body = (await request.json()) as {
          messages: UIMessage[];
          mode?: "explain" | "act";
          scope?: string;
          audience?: "operator" | "citizen";
        };

        // Live situational context: latest events for the active org
        let contextBlock = "";
        try {
          const supabase = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          const { data: events } = await supabase
            .from("events")
            .select("topic, severity, source_module, occurred_at, payload")
            .eq("org_id", DEMO_ORG_ID)
            .order("occurred_at", { ascending: false })
            .limit(8);
          contextBlock = JSON.stringify(events ?? []);
        } catch {
          contextBlock = "[]";
        }

        const mode = body.mode === "act" ? "act" : "explain";
        const audience = body.audience === "citizen" ? "citizen" : "operator";
        const operatorSystem = [
          "You are the EWOS AI Decision Assistant inside an early-warning operations workspace (region: Lake Victoria Basin / Nzoia River, Kenya).",
          "Audience: emergency operations officers. Be terse, structured, and operational. Use short bullet lists. Reference event severity levels (advisory < watch < warning < emergency).",
          mode === "act"
            ? "MODE: ACT — recommend concrete next actions as a numbered checklist with owners and channels (SMS/WhatsApp/field teams). End with a one-line draft alert message ready to send."
            : "MODE: EXPLAIN — interpret the situation: what the data shows, uncertainty, and what to monitor next. Do not draft alert messages.",
          body.scope ? `Scope filter set by the operator: ${body.scope}.` : "",
          `Live event feed (most recent first, JSON): ${contextBlock}`,
        ]
          .filter(Boolean)
          .join("\n");
        const citizenSystem = [
          "You are the EWOS Community Safety Assistant. Audience: members of the public in the Lake Victoria Basin / Nzoia River area, Kenya.",
          "Speak plainly and calmly in short sentences. Avoid jargon. Prioritise personal safety, family preparedness, evacuation routes, and how to report hazards.",
          "If the live feed shows a warning or emergency near the user, lead with the safety action. Never invent hazards not in the feed.",
          "Do NOT draft official alert messages or command-and-control actions — that is for operators.",
          `Live public hazard feed (most recent first, JSON): ${contextBlock}`,
        ].join("\n");
        const system = audience === "citizen" ? citizenSystem : operatorSystem;

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(lovableApiKey, initialRunId);

        const result = streamText({
          model: gateway("google/gemini-3.5-flash"),
          system,
          messages: await convertToModelMessages(body.messages),
        });

        const response = result.toUIMessageStreamResponse({
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { [LOVABLE_AIG_RUN_ID_HEADER]: initialRunId } : {}),
          }),
          onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes("429")) return "Rate limit reached — please retry in a moment.";
            if (message.includes("402")) return "AI credits exhausted — add credits in workspace settings.";
            return message;
          },
        });

        return withLovableAiGatewayRunIdHeader(response, gateway);
      },
    },
  },
});