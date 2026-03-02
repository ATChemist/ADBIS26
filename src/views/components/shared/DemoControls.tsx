import { Tabs } from '../ui/Tabs';
import { Badge } from '../ui/Badge';
import { Switch } from '../ui/Fields';
import type { ClockPreset, ScreenKey, ScreenMode } from '../../../models/types';
import { formatTime } from '../../../utils/format';
import { useScreenDemoController } from '../../../controllers/useScreenDemoController';

const modeOptions: Array<{ value: ScreenMode; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'loading', label: 'Loading' },
  { value: 'empty', label: 'Empty' },
  { value: 'error', label: 'Error' },
];

const clockOptions: Array<{ value: ClockPreset; label: string }> = [
  { value: 'morgen', label: 'Morgen' },
  { value: 'midt-paa-dag', label: 'Midt på dag' },
  { value: 'naer-fyraften', label: 'Nær fyraften' },
];

export function DemoControls({ screenKey }: { screenKey: ScreenKey }) {
  const demo = useScreenDemoController(screenKey);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-700">Demo-tilstand</p>
        <Badge tone="info">Klokke {formatTime(demo.lastSyncedAt)}</Badge>
      </div>
      <div className="grid gap-3">
        <Tabs value={demo.mode} onChange={demo.setMode} options={modeOptions} />
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <Tabs value={demo.clockPreset} onChange={demo.setClockPreset} options={clockOptions} />
          <Switch
            checked={demo.offline}
            onChange={demo.setOffline}
            label="Offline"
            description="Vis banner og lås opdateringer"
          />
        </div>
      </div>
    </div>
  );
}
