import { Activity, Clock3, CloudOff, Server } from "lucide-react";
import { Badge } from "./Badge";
import { CONNECTIVITY_META } from "../utils/mappings";
import { formatClock } from "../utils/time";

export function TopBar({ clockMs, connectivity, queueCount, onConnectivityChange }) {
  const connectivityMeta = CONNECTIVITY_META[connectivity] ?? CONNECTIVITY_META.online;
  const connectivityIcon =
    connectivity === "offline" ? (
      <CloudOff className="h-4 w-4" aria-hidden="true" />
    ) : (
      <Server className="h-4 w-4" aria-hidden="true" />
    );

  return (
    <header className="surface sticky top-3 z-30 overflow-hidden px-4 py-3 md:px-5">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(37,99,235,0.08),transparent_40%)]" aria-hidden="true" />
      <div className="relative grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 shadow-sm">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-caption uppercase tracking-[0.16em]">Hospital Koordinering</p>
            <h1 className="text-lg font-semibold text-slate-900 md:text-xl">Operations Dashboard</h1>
            <p className="text-xs text-slate-500">Moderne klinisk overblik inspireret af Columna</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            <span aria-label="Aktuel tid">{formatClock(clockMs)}</span>
          </div>

          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
            <span className="sr-only">System status</span>
            <Activity className="h-4 w-4" aria-hidden="true" />
            <select
              aria-label="System status"
              className="cursor-pointer bg-transparent text-sm font-semibold text-slate-700"
              value={connectivity}
              onChange={(event) => onConnectivityChange(event.target.value)}
            >
              <option value="online">Online</option>
              <option value="degraded">Degraded</option>
              <option value="offline">Offline</option>
            </select>
          </label>

          <Badge tone={connectivityMeta.tone} className="gap-1.5">
            {connectivityIcon}
            {connectivityMeta.label}
          </Badge>

          <Badge tone={queueCount > 0 ? "warning" : "neutral"} className="font-bold">
            Offline-kø: {queueCount}
          </Badge>
        </div>
      </div>
    </header>
  );
}
