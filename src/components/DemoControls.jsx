import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";
import { DAY_PROFILES } from "../utils/mappings";

export function DemoControls({
  open,
  dayProfile,
  taskVolume,
  onToggle,
  onProfileChange,
  onVolumeChange,
  onSpike
}) {
  return (
    <Card
      className="overflow-hidden p-3"
      title="Demo controls"
      subtitle="Simuler belastning og spikes"
      actions={
        <Button
          variant="tertiary"
          size="sm"
          aria-label={open ? "Skjul demo controls" : "Vis demo controls"}
          onClick={onToggle}
        >
          {open ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
          {open ? "Skjul" : "Vis"}
        </Button>
      }
    >
      {open ? (
        <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr_0.9fr]">
          <label className="space-y-1">
            <span className="text-caption">Travlhedsprofil</span>
            <select
              aria-label="Vælg travlhedsprofil"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm shadow-sm"
              value={dayProfile}
              onChange={(event) => onProfileChange(event.target.value)}
            >
              {Object.entries(DAY_PROFILES).map(([value, profile]) => (
                <option key={value} value={value}>
                  {profile.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-caption">Antal aktive opgaver: {taskVolume}</span>
            <input
              aria-label="Juster antal opgaver"
              type="range"
              min={6}
              max={30}
              step={1}
              value={taskVolume}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              className="h-10 w-full accent-brand-600"
            />
          </label>

          <div className="flex items-end">
            <Button
              variant="danger"
              aria-label="Trigger akut spike"
              icon={Sparkles}
              onClick={onSpike}
              className="w-full"
            >
              Simuler akut spike
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
