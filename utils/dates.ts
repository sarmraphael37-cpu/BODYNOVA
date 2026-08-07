import { format, formatDistanceToNow, isValid, parseISO, startOfDay, endOfDay, subDays, subMonths } from "date-fns";

export function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function formatDate(value: string | Date): string {
  const date = toDate(value);
  return isValid(date) ? format(date, "MMM d, yyyy") : "—";
}

export function formatDateShort(value: string | Date): string {
  const date = toDate(value);
  return isValid(date) ? format(date, "MMM d") : "—";
}

export function formatTime(value: string | Date): string {
  const date = toDate(value);
  return isValid(date) ? format(date, "h:mm a") : "—";
}

export function relativeTime(value: string | Date): string {
  const date = toDate(value);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "—";
}

export function todayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function startOfToday(): Date {
  return startOfDay(new Date());
}

export function endOfToday(): Date {
  return endOfDay(new Date());
}

export type DateRangePreset = "7d" | "30d" | "3m" | "6m" | "1y" | "all";

export function dateRangeForPreset(
  preset: Exclude<DateRangePreset, "all">
): { from: Date; to: Date } {
  const to = endOfDay(new Date());
  let from: Date;
  switch (preset) {
    case "7d":
      from = startOfDay(subDays(new Date(), 6));
      break;
    case "30d":
      from = startOfDay(subDays(new Date(), 29));
      break;
    case "3m":
      from = startOfDay(subMonths(new Date(), 3));
      break;
    case "6m":
      from = startOfDay(subMonths(new Date(), 6));
      break;
    case "1y":
      from = startOfDay(subMonths(new Date(), 12));
      break;
  }
  return { from, to };
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  return toDate(a).toDateString() === toDate(b).toDateString();
}
