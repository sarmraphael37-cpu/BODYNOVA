export function formatNumber(value: number, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

export function formatKg(kg: number, maximumFractionDigits = 1): string {
  return `${formatNumber(kg, maximumFractionDigits)} kg`;
}

export function formatLbs(kg: number): string {
  const lbs = kg * 2.2046226218;
  return `${formatNumber(lbs, 0)} lbs`;
}

export function formatCmLbs(cm: number): string {
  return `${formatNumber(cm, 0)} cm`;
}

export function formatLiters(ml: number): string {
  return `${formatNumber(ml / 1000, 2)} L`;
}

export function formatMl(ml: number): string {
  return `${formatNumber(ml, 0)} ml`;
}

export function formatSteps(steps: number): string {
  return formatNumber(steps, 0);
}

export function formatKm(km: number): string {
  return `${formatNumber(km, 2)} km`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatCalories(calories: number): string {
  return formatNumber(calories, 0);
}

export function formatPercent(value: number, maximumFractionDigits = 0): string {
  return `${formatNumber(value, maximumFractionDigits)}%`;
}

export function formatBmi(value: number): string {
  return formatNumber(value, 1);
}

export function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatSleepMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function formatChange(value: number, unit = ""): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, 1)}${unit ? ` ${unit}` : ""}`;
}
