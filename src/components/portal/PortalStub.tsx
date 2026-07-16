import type { LucideIcon } from "lucide-react";

export function PortalStub({
  icon: Icon,
  eyebrow,
  title,
  body,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-3xl p-10">
      <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon className="size-6 text-primary" />
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}