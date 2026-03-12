import { Activity, Clock3, CloudOff, Server, Sparkles } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { CONNECTIVITY_META } from "../utils/mappings";
import { formatClock } from "../utils/time";

export function TopBar({ clockMs, connectivity, queueCount, onConnectivityChange, onOpenSimulation }) {
  const connectivityMeta = CONNECTIVITY_META[connectivity] ?? CONNECTIVITY_META.online;
  const connectivityIcon =
    connectivity === "offline" ? (
      <CloudOff className="h-4 w-4" aria-hidden="true" />
    ) : (
      <Server className="h-4 w-4" aria-hidden="true" />
    );

  const tone =
    connectivityMeta.tone === "success"
      ? "success"
      : connectivityMeta.tone === "warning"
      ? "warning"
      : "danger";

  return (
    <header className="surface sticky top-3 z-40 px-6 py-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-app-primary/10 text-app-primary">
            <Activity className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">Hospital Koordineringssystem</p>
            <h1 className="text-lg font-semibold text-app-text md:text-xl">Operations Control Room</h1>
            <p className="text-xs text-app-muted">Klinisk, moderne og handlingsorienteret UI</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="md"
            aria-label="Åbn simulation panel"
            icon={Sparkles}
            onClick={onOpenSimulation}
          >
            Simulation
          </Button>

          <div className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-app-border bg-white px-3 text-sm text-app-text">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            <span aria-label="Aktuel tid">{formatClock(clockMs)}</span>
          </div>

          <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-app-border bg-white px-3 text-sm text-app-text">
            <span className="sr-only">System status</span>
            <Activity className="h-4 w-4" aria-hidden="true" />
            <select
              aria-label="System status"
              className="cursor-pointer bg-transparent text-sm font-semibold text-app-text"
              value={connectivity}
              onChange={(event) => onConnectivityChange(event.target.value)}
            >
              <option value="online">Online</option>
              <option value="degraded">Degraded</option>
              <option value="offline">Offline</option>
            </select>
          </label>

          <Badge kind="status" tone={tone} className="gap-1.5">
            {connectivityIcon}
            {connectivityMeta.label}
          </Badge>

          <Badge kind="status" tone={queueCount > 0 ? "warning" : "neutral"}>
            Kø: {queueCount}
          </Badge>
        </div>
      </div>
    </header>
  );
}
