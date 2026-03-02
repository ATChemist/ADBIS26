import { useAppController } from './useAppController';
import type { ClockPreset, ScreenKey, ScreenMode } from '../models/types';

export function useScreenDemoController(screenKey: ScreenKey) {
  const controller = useAppController();
  const mode = controller.state.screenModes[screenKey] ?? 'normal';

  return {
    mode,
    offline: controller.state.offline,
    lastSyncedAt: controller.state.lastSyncedAt,
    clockPreset: controller.state.clockPreset,
    setMode(nextMode: ScreenMode) {
      controller.setScreenMode(screenKey, nextMode);
    },
    setOffline(offline: boolean) {
      controller.setOffline(offline);
    },
    setClockPreset(preset: ClockPreset) {
      controller.setClockPreset(preset);
    },
    retry() {
      controller.retryScreen(screenKey);
    },
  };
}
