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

type DateInput = string | Date | null | undefined;

function toValidDate(value: DateInput) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: DateInput) {
  const date = toValidDate(value);
  return date ? DATE_FMT.format(date) : "Date unavailable";
}

export function formatDateShort(value: DateInput) {
  const date = toValidDate(value);
  return date ? DATE_SHORT_FMT.format(date) : "Date unavailable";
}

export function formatTime(value: DateInput) {
  const date = toValidDate(value);
  return date ? TIME_FMT.format(date) : "Time unavailable";
}

export function formatDateTime(value: DateInput) {
  const date = toValidDate(value);
  return date ? DATETIME_FMT.format(date) : "Date unavailable";
}

export function isUpcoming(value: DateInput) {
  const date = toValidDate(value);
  return date ? date.getTime() > Date.now() : false;
}

export function isPast(value: DateInput) {
  const date = toValidDate(value);
  return date ? date.getTime() < Date.now() : false;
}

export function relativeTime(value: DateInput) {
  const date = toValidDate(value);
  if (!date) return "Date unavailable";

  const diffMs = date.getTime() - Date.now();
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
