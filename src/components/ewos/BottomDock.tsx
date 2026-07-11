import { useEffect, useState } from "react";
import { Activity, Loader2, ScanLine, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomDockProps {
  activeModule: string | null;
  scanning: boolean;
  onRunScan: () => void;
  onToggleAI: () => void;
  eventCount: number;
}

export function BottomDock({ activeModule, scanning, onRunScan, onToggleAI, eventCount }: BottomDockProps) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className="flex h-9 shrink-0 items-center gap-3 border-t border-border bg-sidebar px-3">
      <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Activity className="size-3.5 text-primary" />
        <span className="text-data">
          {activeModule ? `${activeModule.toUpperCase()} · active` : "MONITORING · Nzoia basin"}
        </span>
      </span>
      <span className="text-data text-[11px] text-muted-foreground">{eventCount} events</span>

      <div className="mx-auto flex items-center gap-1.5">
        <button
          onClick={onRunScan}
          disabled={scanning}
          className={cn(
            "flex h-6 items-center gap-1.5 rounded-md border border-border bg-secondary px-2 text-[11px] font-medium text-secondary-foreground transition-colors hover:border-primary/50 hover:text-primary",
            scanning && "opacity-60",
          )}
        >
          {scanning ? <Loader2 className="size-3 animate-spin" /> : <ScanLine className="size-3" />}
          Run flood risk scan
        </button>
        <button
          onClick={onToggleAI}
          className="flex h-6 items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
        >
          <Sparkles className="size-3" />
          Ask AI
        </button>
      </div>

      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-severity-advisory" aria-hidden />
        <span className="text-[11px] text-muted-foreground">Live</span>
      </span>
      <span className="text-data text-[11px] tabular-nums text-muted-foreground" suppressHydrationWarning>
        {now.toISOString().slice(11, 19)} UTC
      </span>
    </footer>
  );
}