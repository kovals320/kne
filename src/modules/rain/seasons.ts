import type { Day } from "./data";

// A rain season is September to May. June-August rain counts toward the season that starts that September,
// so for totals a season runs June to May and is named by its September: 2025 = "25/26".

export const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
export const MONTHS_SHORT = ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"];

// Season columns in order. "summer" = June-August of the season's first year.
export type MonthKey = "summer" | 9 | 10 | 11 | 12 | 1 | 2 | 3 | 4 | 5;
export const SEASON_MONTHS: MonthKey[] = ["summer", 9, 10, 11, 12, 1, 2, 3, 4, 5];

export function monthKey(month: number): MonthKey {
  return month >= 6 && month <= 8 ? "summer" : (month as MonthKey);
}

export function monthLabel(k: MonthKey, short = false) {
  if (k === "summer") return short ? "יוני–אוג׳" : "יוני–אוגוסט";
  return (short ? MONTHS_SHORT : MONTHS_HE)[k - 1];
}

export function seasonLabel(s: number) {
  const two = (n: number) => String(((n % 100) + 100) % 100).padStart(2, "0");
  return `${two(s)}/${two(s + 1)}`;
}

export function seasonOf(date: string) {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7));
  return m >= 6 ? y : y - 1;
}

// Today's date in Israel, YYYY-MM-DD.
export function todayIL() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
}

export function currentSeason() {
  return seasonOf(todayIL());
}

export function formatMm(n: number) {
  return n.toLocaleString("he-IL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatDate(date: string) {
  const [y, m, d] = date.split("-");
  return `${Number(d)}.${Number(m)}.${y}`;
}

const DAY_MS = 86_400_000;
const utc = (date: string) => Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)));

// Days since 1 September of the season (summer rain is counted at day 0). 0..272.
export function seasonDayOffset(date: string) {
  const s = seasonOf(date);
  const off = Math.round((utc(date) - Date.UTC(s, 8, 1)) / DAY_MS);
  return Math.max(0, off);
}
export const SEASON_LENGTH = Math.round((Date.UTC(2001, 4, 31) - Date.UTC(2000, 8, 1)) / DAY_MS); // Sep 1 - May 31

export type Season = {
  season: number;
  label: string;
  total: number;
  rainDays: number;
  months: Record<string, number>;
  maxDay: { date: string; mm: number } | null;
  lastReport: string | null;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function buildSeasons(days: Day[]): Map<number, Season> {
  const map = new Map<number, Season>();
  for (const d of days) {
    let s = map.get(d.season);
    if (!s) {
      s = { season: d.season, label: seasonLabel(d.season), total: 0, rainDays: 0, months: {}, maxDay: null, lastReport: null };
      map.set(d.season, s);
    }
    const k = String(monthKey(Number(d.date.slice(5, 7))));
    s.months[k] = round1((s.months[k] ?? 0) + d.mm);
    s.total = round1(s.total + d.mm);
    if (d.mm > 0) s.rainDays++;
    if (!s.maxDay || d.mm > s.maxDay.mm) s.maxDay = { date: d.date, mm: d.mm };
    if (!s.lastReport || d.date > s.lastReport) s.lastReport = d.date;
  }
  return map;
}

export type Summary = {
  current: number;
  seasons: Season[]; // all seasons with data, oldest first
  complete: Season[]; // seasons before the current one
  average: number;
  wettest: Season;
  driest: Season;
  wettestDay: Day;
  monthAverages: Record<string, number>;
};

export function summarize(days: Day[]): Summary {
  const current = currentSeason();
  const map = buildSeasons(days);
  const seasons = [...map.values()].sort((a, b) => a.season - b.season);
  const complete = seasons.filter((s) => s.season < current);
  const average = round1(complete.reduce((n, s) => n + s.total, 0) / Math.max(1, complete.length));
  const wettest = complete.reduce((a, b) => (b.total > a.total ? b : a));
  const driest = complete.reduce((a, b) => (b.total < a.total ? b : a));
  const wettestDay = days.reduce((a, b) => (b.mm > a.mm ? b : a));
  const monthAverages: Record<string, number> = {};
  for (const k of SEASON_MONTHS) {
    monthAverages[String(k)] = round1(complete.reduce((n, s) => n + (s.months[String(k)] ?? 0), 0) / Math.max(1, complete.length));
  }
  return { current, seasons, complete, average, wettest, driest, wettestDay, monthAverages };
}

// Running total through the season, one value per day offset (0..SEASON_LENGTH).
export function cumulative(days: Day[], season: number) {
  const perDay = new Array(SEASON_LENGTH + 1).fill(0);
  for (const d of days) if (d.season === season) perDay[Math.min(SEASON_LENGTH, seasonDayOffset(d.date))] += d.mm;
  let run = 0;
  return perDay.map((v) => (run = round1(run + v)));
}

// Average of the complete seasons' running totals.
export function averageCumulative(days: Day[], seasons: number[]) {
  const sum = new Array(SEASON_LENGTH + 1).fill(0);
  for (const s of seasons) cumulative(days, s).forEach((v, i) => (sum[i] += v));
  return sum.map((v) => round1(v / Math.max(1, seasons.length)));
}

// Trailing moving average over n seasons (null until n seasons are available).
export function movingAverage(values: number[], n: number): (number | null)[] {
  return values.map((_, i) => (i < n - 1 ? null : round1(values.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n)));
}

// Least-squares line through (season, total), with r² to show how much of the variation the trend explains.
export function linearTrend(points: { x: number; y: number }[]) {
  const n = points.length;
  const mx = points.reduce((a, p) => a + p.x, 0) / n;
  const my = points.reduce((a, p) => a + p.y, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const p of points) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
    syy += (p.y - my) ** 2;
  }
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const r2 = syy > 0 ? (sxy * sxy) / (sxx * syy) : 0;
  return { slope, intercept, r2, at: (x: number) => intercept + slope * x };
}

export type Decade = { start: number; label: string; seasons: number; average: number; min: Season; max: Season };

// Seasons grouped by decade of their first year: the 70s = 70/71 … 79/80.
export function decades(complete: Season[]): Decade[] {
  const groups = new Map<number, Season[]>();
  for (const s of complete) {
    const d = Math.floor(s.season / 10) * 10;
    groups.set(d, [...(groups.get(d) ?? []), s]);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([start, list]) => ({
      start,
      label: start >= 2000 ? `שנות ה-${start}` : `שנות ה-${start % 100}`,
      seasons: list.length,
      average: round1(list.reduce((a, s) => a + s.total, 0) / list.length),
      min: list.reduce((a, b) => (b.total < a.total ? b : a)),
      max: list.reduce((a, b) => (b.total > a.total ? b : a)),
    }));
}
