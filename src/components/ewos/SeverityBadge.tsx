import { cn } from "@/lib/utils";
import type { EwosSeverity } from "@/sdk";

const styles: Record<EwosSeverity, string> = {
  advisory: "text-severity-advisory border-severity-advisory/40 bg-severity-advisory/10",
  watch: "text-severity-watch border-severity-watch/40 bg-severity-watch/10",
  warning: "text-severity-warning border-severity-warning/40 bg-severity-warning/10",
  emergency: "text-severity-emergency border-severity-emergency/50 bg-severity-emergency/15",
};

export function SeverityBadge({ severity, className }: { severity: string; className?: string }) {
  const s = (["advisory", "watch", "warning", "emergency"].includes(severity)
    ? severity
    : "advisory") as EwosSeverity;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-px text-data text-[10px] font-medium uppercase tracking-wider",
        styles[s],
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          s === "advisory" && "bg-severity-advisory",
          s === "watch" && "bg-severity-watch",
          s === "warning" && "bg-severity-warning",
          s === "emergency" && "bg-severity-emergency animate-pulse",
        )}
        aria-hidden
      />
      {s}
    </span>
  );
}