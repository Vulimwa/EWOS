import { createFileRoute } from "@tanstack/react-router";
import { BellRing } from "lucide-react";
import { useOrg, useNotifications } from "@/lib/ewos-queries";

export const Route = createFileRoute("/portal/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data: org } = useOrg();
  const { data: notifs } = useNotifications(org?.id);
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Broadcast</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">In-app feed. SMS, WhatsApp, Push and Email adapters ship in Sprint 3.</p>
      </header>
      <section className="rounded-lg border border-border bg-card">
        <ul className="divide-y divide-border">
          {(notifs ?? []).map((n) => (
            <li key={n.id} className="flex items-start gap-3 px-4 py-3 text-sm">
              <BellRing className="mt-0.5 size-4 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{n.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{n.channel}</span>
            </li>
          ))}
          {!(notifs ?? []).length && (
            <li className="px-4 py-10 text-center text-xs text-muted-foreground">No notifications yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}