import { useRef, useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SCOPES = ["Nzoia basin", "All regions"] as const;

export function AIAssistant({ open, onOpenChange }: AIAssistantProps) {
  const [mode, setMode] = useState<"explain" | "act">("explain");
  const [scope, setScope] = useState<(typeof SCOPES)[number]>("Nzoia basin");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const busy = status === "submitted" || status === "streaming";

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage({ text }, { body: { mode, scope } });
  };

  return (
    <>
      {/* Floating action button */}
      {!open && (
        <button
          onClick={() => onOpenChange(true)}
          aria-label="Open AI Decision Assistant (A)"
          className="fixed bottom-12 right-4 z-40 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          <Sparkles className="size-5" />
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label="AI Decision Assistant"
          className="overlay-elevated fixed bottom-12 right-4 z-40 flex h-[520px] max-h-[calc(100vh-8rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-xl"
        >
          <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground">Decision Assistant</h2>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close assistant"
              className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </header>

          <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
            <div role="radiogroup" aria-label="Assistant mode" className="flex rounded-md border border-border p-0.5">
              {(["explain", "act"] as const).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                    mode === m ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-1">
              {SCOPES.map((s) => (
                <button
                  key={s}
                  onClick={() => setScope(s)}
                  aria-pressed={scope === s}
                  className={cn(
                    "rounded-sm border px-1.5 py-0.5 text-[10px] transition-colors",
                    scope === s
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {!messages.length && (
              <div className="rounded-md border border-border bg-background/50 p-3 text-xs leading-relaxed text-muted-foreground">
                Ask about the live situation, e.g.{" "}
                <button
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={() => setInput("What is the current flood risk on the Nzoia River and what should we do next?")}
                >
                  “What is the current flood risk on the Nzoia River?”
                </button>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed",
                  message.role === "user"
                    ? "ml-auto bg-primary/15 text-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {message.parts.map((part, i) =>
                  part.type === "text" ? (
                    <p key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </p>
                  ) : null,
                )}
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> Analysing…
              </div>
            )}
            {error && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-[11px] text-destructive">
                {error.message}
              </p>
            )}
          </div>

          <form
            className="flex items-center gap-2 border-t border-border p-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "act" ? "What should we do about…" : "Explain the current situation…"}
              aria-label="Message the assistant"
              className="h-8 flex-1 rounded-md border border-border bg-background px-2.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}