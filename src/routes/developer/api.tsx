import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Code2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import openapi from "../../../docs/api/openapi.json";

export const Route = createFileRoute("/developer/api")({ component: ApiExplorer });

type MethodSpec = { tags?: string[]; summary?: string; description?: string; parameters?: unknown[]; requestBody?: unknown; responses?: Record<string, { description?: string }> };
type PathItem = Record<string, MethodSpec>;

const METHOD_COLORS: Record<string, string> = {
  get: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  post: "text-sky-400 border-sky-500/40 bg-sky-500/10",
  put: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  patch: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  delete: "text-rose-400 border-rose-500/40 bg-rose-500/10",
};

function ApiExplorer() {
  const paths = (openapi.paths ?? {}) as Record<string, PathItem>;
  const entries = useMemo(() => {
    const rows: { path: string; method: string; spec: MethodSpec }[] = [];
    for (const [path, item] of Object.entries(paths)) {
      for (const [method, spec] of Object.entries(item)) {
        rows.push({ path, method: method.toLowerCase(), spec });
      }
    }
    return rows;
  }, [paths]);

  const [openKey, setOpenKey] = useState<string | null>(entries[0] ? `${entries[0].method}:${entries[0].path}` : null);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Developer Portal</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Code2 className="size-5 text-primary" /> API Explorer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {openapi.info?.title} · v{openapi.info?.version}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{openapi.info?.description}</p>
      </header>

      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 text-sm font-semibold">
          <span>{entries.length} endpoints</span>
          <a
            href="/docs/api/openapi.json"
            className="text-xs font-normal text-primary hover:underline"
          >
            openapi.json
          </a>
        </header>
        <ul className="divide-y divide-border">
          {entries.map(({ path, method, spec }) => {
            const key = `${method}:${path}`;
            const open = openKey === key;
            return (
              <li key={key}>
                <button
                  onClick={() => setOpenKey(open ? null : key)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-accent/40"
                >
                  <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
                  <span className={cn("shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase", METHOD_COLORS[method] ?? "border-border text-muted-foreground")}>
                    {method}
                  </span>
                  <span className="font-mono text-xs text-data">{path}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">{spec.summary}</span>
                </button>
                {open && (
                  <div className="space-y-3 border-t border-border bg-background/40 px-11 py-4 text-xs">
                    {spec.description && <p className="text-muted-foreground">{spec.description}</p>}
                    {spec.tags?.length ? (
                      <div className="flex gap-1.5">
                        {spec.tags.map((t) => (
                          <span key={t} className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    ) : null}
                    {spec.responses && (
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Responses</p>
                        <ul className="space-y-1">
                          {Object.entries(spec.responses).map(([code, r]) => (
                            <li key={code} className="flex gap-2 font-mono text-[11px]">
                              <span className="text-primary">{code}</span>
                              <span className="text-muted-foreground">{r.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}