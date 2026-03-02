import { Inbox } from "lucide-react";

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <Inbox className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" />
      <p className="mt-2 text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
