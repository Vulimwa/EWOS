import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen/assistant")({ component: CitizenAssistant });

const SUGGESTIONS = [
  "What should my family do to prepare for a flood?",
  "Is there any active hazard warning near Nzoia River right now?",
  "How do I report flooding in my neighbourhood?",
  "What are the safest evacuation routes if the river rises?",
];

function CitizenAssistant() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const busy = status === "submitted" || status === "streaming";

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    void sendMessage({ text: value }, { body: { audience: "citizen", mode: "explain" } });
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col p-6">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Citizen Portal</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <MessageCircle className="size-5 text-primary" /> Safety Assistant
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask about preparedness, current hazards near you, and what to do next. Answers use the live public hazard feed.
        </p>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-border bg-card p-4">
        {!messages.length && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 rounded-md border border-border bg-background/50 p-3 text-sm text-muted-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>Hi — I&apos;m the community safety assistant. Ask me anything about staying safe from local hazards.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => submit(s)}
                  className="rounded-md border border-border bg-background/60 px-3 py-2 text-left text-xs text-foreground hover:border-primary/40 hover:bg-accent/40">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message: UIMessage) => {
          const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          return (
            <div key={message.id}
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                message.role === "user" ? "ml-auto bg-primary/15 text-foreground" : "bg-secondary text-secondary-foreground",
              )}>
              {message.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{text}</p>
              )}
            </div>
          );
        })}

        {busy && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Thinking…
          </div>
        )}
        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
            {error.message}
          </p>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(input); }}
        className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-card p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about safety, alerts, evacuation…"
          className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button type="submit" disabled={busy || !input.trim()}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50">
          <Send className="size-3.5" /> Send
        </button>
      </form>
    </div>
  );
}