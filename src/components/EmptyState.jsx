import { Inbox } from "lucide-react";

export function EmptyState({ title, description }) {
  return (
    <div className="surface-subtle rounded-xl border-dashed p-6 text-center">
      <Inbox className="mx-auto h-6 w-6 text-app-muted" aria-hidden="true" />
      <p className="mt-2 text-sm font-semibold text-app-text">{title}</p>
      <p className="mt-1 text-sm text-app-muted">{description}</p>
    </div>
  );
}
