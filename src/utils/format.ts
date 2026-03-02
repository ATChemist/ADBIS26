const timeFormatter = new Intl.DateTimeFormat('da-DK', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatTime(value: number): string {
  return timeFormatter.format(new Date(value));
}

export function minutesAgo(from: number, now: number): string {
  const mins = Math.max(0, Math.floor((now - from) / 60000));
  if (mins < 1) return 'Lige nu';
  if (mins === 1) return '1 min';
  return `${mins} min`;
}

export function formatCountdown(msLeft: number): string {
  const safe = Math.max(0, msLeft);
  const totalSeconds = Math.floor(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} t ${m} min` : `${h} t`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
