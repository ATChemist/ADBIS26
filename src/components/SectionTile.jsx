import { Building2 } from "lucide-react";
import { Badge } from "./ui/Badge";
import { ListRow } from "./ui/ListRow";

function mapStatus(status) {
  if (status === "crit") {
    return { label: "Kritisk", tone: "danger" };
  }

  if (status === "warn") {
    return { label: "Pres", tone: "warning" };
  }

  return { label: "OK", tone: "success" };
}

export function SectionTile({ section }) {
  const status = mapStatus(section.status);

  return (
    <ListRow
      leading={<Building2 className="h-4 w-4 text-app-muted" aria-hidden="true" />}
      title={section.name}
      subtitle={`Aktive: ${section.taskCount} · Kritiske: ${section.criticalCount}`}
      trailing={<Badge kind="status" tone={status.tone}>{status.label}</Badge>}
    />
  );
}
