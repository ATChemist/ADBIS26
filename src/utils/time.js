export function formatClock(timeMs) {
  return new Intl.DateTimeFormat("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(timeMs);
}

export function formatDateTime(iso) {
  if (!iso) {
    return "-";
  }

  return new Intl.DateTimeFormat("da-DK", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}

export function minutesSince(iso, nowMs = Date.now()) {
  if (!iso) {
    return 0;
  }

  const diff = nowMs - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

export function formatRelative(iso, nowMs = Date.now()) {
  const mins = minutesSince(iso, nowMs);

  if (mins < 1) {
    return "lige nu";
  }

  if (mins < 60) {
    return `${mins} min siden`;
  }

  const hours = Math.floor(mins / 60);
  return `${hours} t siden`;
}

export function isOlderThanMinutes(iso, minuteLimit, nowMs = Date.now()) {
  if (!iso) {
    return false;
  }

  return nowMs - new Date(iso).getTime() >= minuteLimit * 60000;
}

export function randomLatency(minMs = 300, maxMs = 600) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}
