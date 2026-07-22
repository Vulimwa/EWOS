import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { BookOpen, ExternalLink } from "lucide-react";
import sdkDoc from "../../../docs/sdk.md?raw";

export const Route = createFileRoute("/developer/sdk")({ component: SdkDocs });

function SdkDocs() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Developer Portal</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <BookOpen className="size-5 text-primary" /> SDK Documentation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Contract for HazardApps — the plug-in modules that render inside the EWOS shell.
          </p>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          Source <ExternalLink className="size-3" />
        </a>
      </header>

      <article className="prose prose-sm prose-invert max-w-none rounded-lg border border-border bg-card p-6 prose-headings:tracking-tight prose-code:rounded prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:text-primary prose-pre:bg-secondary/50">
        <ReactMarkdown>{sdkDoc}</ReactMarkdown>
      </article>
    </div>
  );
}