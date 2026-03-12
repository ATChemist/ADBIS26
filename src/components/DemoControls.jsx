import { Sparkles } from "lucide-react";
import { Button } from "./ui/Button";
import { SectionTitle } from "./ui/SectionTitle";
import { DAY_PROFILES } from "../utils/mappings";

export function DemoControls({ dayProfile, taskVolume, onProfileChange, onVolumeChange, onSpike }) {
  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Simulation"
        title="Belastnings-scenarier"
        subtitle="Bruges til demo af travlhed, opgavemængde og akutte spikes"
      />

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-muted">Travlhedsprofil</p>
        <select
          aria-label="Vælg travlhedsprofil"
          className="min-h-11 w-full rounded-xl border border-app-border bg-white px-3 text-sm text-app-text"
          value={dayProfile}
          onChange={(event) => onProfileChange(event.target.value)}
        >
          {Object.entries(DAY_PROFILES).map(([value, profile]) => (
            <option key={value} value={value}>
              {profile.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-app-muted">
          Antal aktive opgaver: {taskVolume}
        </p>
        <input
          aria-label="Juster antal opgaver"
          type="range"
          min={6}
          max={30}
          step={1}
          value={taskVolume}
          onChange={(event) => onVolumeChange(Number(event.target.value))}
          className="h-11 w-full accent-app-primary"
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        aria-label="Simuler akut spike"
        icon={Sparkles}
        onClick={onSpike}
        className="w-full"
      >
        Simuler akut spike
      </Button>
    </div>
  );
}
