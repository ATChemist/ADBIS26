import { formatTime } from '../../../utils/format';

interface OfflineBannerProps {
  offline: boolean;
  lastSyncedAt: number;
}

export function OfflineBanner({ offline, lastSyncedAt }: OfflineBannerProps) {
  if (!offline) return null;

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm" role="status" aria-live="polite">
      <div className="flex items-start gap-2">
        <span aria-hidden>⚠️</span>
        <div>
          <p className="font-semibold">Offline - viser seneste opdatering: {formatTime(lastSyncedAt)}</p>
          <p className="mt-1 text-xs">Du kan stadig se opgaver, men ikke opdatere lige nu.</p>
        </div>
      </div>
    </div>
  );
}
