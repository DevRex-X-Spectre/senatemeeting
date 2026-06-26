// Date/time formatting helpers — no external lib, uses native Intl.

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const DATE_SHORT_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const TIME_FMT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const DATETIME_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(value: string | Date) {
  return DATE_FMT.format(new Date(value));
}

export function formatDateShort(value: string | Date) {
  return DATE_SHORT_FMT.format(new Date(value));
}

export function formatTime(value: string | Date) {
  return TIME_FMT.format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return DATETIME_FMT.format(new Date(value));
}

export function isUpcoming(value: string | Date) {
  return new Date(value).getTime() > Date.now();
}

export function isPast(value: string | Date) {
  return new Date(value).getTime() < Date.now();
}

export function relativeTime(value: string | Date) {
  const diffMs = new Date(value).getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const future = diffMs > 0;
  const fmt = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  if (abs < minute) return "just now";
  if (abs < hour) return fmt.format(future ? Math.round(diffMs / minute) : -Math.round(abs / minute), "minute");
  if (abs < day) return fmt.format(future ? Math.round(diffMs / hour) : -Math.round(abs / hour), "hour");
  return fmt.format(future ? Math.round(diffMs / day) : -Math.round(abs / day), "day");
}