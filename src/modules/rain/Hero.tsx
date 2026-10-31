import { DropIcon } from "@/modules/rain/ui";
import type { Day } from "@/modules/rain/data";
import { formatDate, formatMm, seasonLabel } from "@/modules/rain/seasons";

const DAY_MS = 86_400_000;
const utc = (d: string) => Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
const WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function whenText(date: string, today: string) {
  const n = Math.round((utc(today) - utc(date)) / DAY_MS);
  if (n <= 0) return "היום";
  if (n === 1) return "אתמול";
  if (n === 2) return "שלשום";
  if (n < 7) return `ביום ${WEEKDAYS[new Date(utc(date)).getUTCDay()]}`;
  return `לפני ${n} ימים`;
}

// The latest rain report and the run of consecutive rainy days that ends with it.
export function lastRain(days: Day[]) {
  const wet = days.filter((d) => d.mm > 0);
  const last = wet[wet.length - 1];
  if (!last) return null;
  let total = last.mm;
  let count = 1;
  for (let i = wet.length - 2; i >= 0; i--) {
    if (utc(wet[i + 1].date) - utc(wet[i].date) !== DAY_MS) break;
    total += wet[i].mm;
    count++;
  }
  return { day: last, eventTotal: Math.round(total * 10) / 10, eventDays: count };
}

function Compare({ label, value, base }: { label: string; value: number; base: number }) {
  const diff = Math.round((value - base) * 10) / 10;
  const p = base > 0 ? Math.round((value / base) * 100) : null;
  const up = diff > 0;
  return (
    <div className="rounded-2xl bg-white/12 px-4 py-3 ring-1 ring-white/20">
      <p className="text-sm text-white/85">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums">
        {formatMm(base)} <span className="text-base font-medium">מ&quot;מ</span>
      </p>
      {base > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
          <span
            aria-hidden
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${up ? "bg-emerald-300 text-emerald-950" : diff < 0 ? "bg-amber-300 text-amber-950" : "bg-white/70 text-ink"}`}
          >
            {up ? "▲" : diff < 0 ? "▼" : "="}
          </span>
          {diff === 0
            ? "בדיוק אותו דבר"
            : `השנה ${up ? "יותר" : "פחות"} ב-${formatMm(Math.abs(diff))} מ"מ`}
          {p !== null && (
            <span className="font-normal text-white/85">
              · {p >= 200 ? `פי ${(Math.round((value / base) * 10) / 10).toLocaleString("he-IL")}` : `${p}%`}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

export function Hero({
  days,
  today,
  season,
  seasonTotal,
  rainDays,
  lastSeasonToDate,
  averageToDate,
  averageSeason,
}: {
  days: Day[];
  today: string;
  season: number;
  seasonTotal: number;
  rainDays: number;
  lastSeasonToDate: number;
  averageToDate: number;
  averageSeason: number;
}) {
  const rain = lastRain(days);
  const progress = averageSeason > 0 ? Math.min(100, (seasonTotal / averageSeason) * 100) : 0;
  const marker = averageSeason > 0 ? Math.min(100, (averageToDate / averageSeason) * 100) : 0;

  return (
    <section
      aria-label="המדידה האחרונה והעונה הנוכחית"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rain to-rain-deep px-5 py-6 text-white shadow-md sm:px-7"
    >
      {/* Decorative drops */}
      <span aria-hidden className="pointer-events-none absolute left-6 top-5 hidden text-white/10 sm:block">
        <DropIcon className="h-36 w-36" />
      </span>

      {rain && (
        <div className="relative">
          <p className="text-white/85">
            המדידה האחרונה · {whenText(rain.day.date, today)}, {formatDate(rain.day.date)}
          </p>
          <p className="mt-1 text-6xl font-bold tabular-nums leading-none sm:text-7xl">
            {formatMm(rain.day.mm)} <span className="text-2xl font-medium sm:text-3xl">מ&quot;מ</span>
          </p>
          {rain.eventDays > 1 && (
            <p className="mt-2 text-white/90">
              {rain.eventDays} ימי גשם ברצף · {formatMm(rain.eventTotal)} מ&quot;מ בסך הכל
            </p>
          )}
        </div>
      )}

      <div className="relative mt-6 border-t border-white/20 pt-5">
        <p className="text-white/85">סה&quot;כ העונה ({seasonLabel(season)})</p>
        <p className="mt-1 text-4xl font-bold tabular-nums">
          {formatMm(seasonTotal)} <span className="text-xl font-medium">מ&quot;מ</span>
        </p>
        <p className="mt-0.5 text-sm text-white/85">
          {rainDays > 0 ? `${rainDays} ימי גשם עד עכשיו` : "עדיין לא ירד גשם העונה"}
        </p>

        {/* Progress towards an average season, with a marker where the average stands on today's date */}
        <div className="mt-4" aria-hidden>
          <div className="relative h-3 rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
            {marker > 0 && (
              <span className="absolute -top-1 h-5 w-0.5 rounded bg-amber-300" style={{ insetInlineStart: `${marker}%` }} />
            )}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-white/85">
            <span>{Math.round(progress)}% מעונה ממוצעת ({formatMm(averageSeason)} מ&quot;מ)</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-0.5 rounded bg-amber-300" /> הממוצע עד היום
            </span>
          </div>
        </div>

        <p className="sr-only">
          {Math.round(progress)}% מעונה ממוצעת. הממוצע עד היום הוא {formatMm(averageToDate)} מילימטר.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Compare label="בשנה שעברה עד אותו תאריך" value={seasonTotal} base={lastSeasonToDate} />
          <Compare label="בממוצע עד אותו תאריך" value={seasonTotal} base={averageToDate} />
        </div>
      </div>
    </section>
  );
}
