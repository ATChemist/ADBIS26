import { AlertTriangle, Activity, Building2 } from "lucide-react";
import { Badge } from "./Badge";
import { Card } from "./Card";

function mapLoadToBadge(status) {
  if (status === "crit") {
    return { label: "Kritisk", tone: "danger" };
  }

  if (status === "warn") {
    return { label: "Pres", tone: "warning" };
  }

  return { label: "OK", tone: "success" };
}

export function SectionTile({ section }) {
  const statusMeta = mapLoadToBadge(section.status);

  return (
    <Card className="p-3.5">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <p className="text-caption uppercase tracking-[0.12em]">Afsnit</p>
          <h4 className="mt-1 text-sm font-semibold text-slate-900">{section.name}</h4>
        </div>
        <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="surface-soft p-2">
          <Building2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <p className="mt-1 text-base font-semibold text-slate-900">{section.taskCount}</p>
          <p className="text-slate-500">Aktive</p>
        </div>
        <div className="surface-soft p-2">
          <Activity className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <p className="mt-1 text-base font-semibold text-slate-900">{section.criticalCount}</p>
          <p className="text-slate-500">Kritiske</p>
        </div>
        <div className="surface-soft p-2">
          <AlertTriangle className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <p className="mt-1 text-base font-semibold text-slate-900">{statusMeta.label}</p>
          <p className="text-slate-500">Niveau</p>
        </div>
      </div>
    </Card>
  );
}
