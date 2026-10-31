import { getDays } from "./data";
import { lastRain, whenText } from "./Hero";
import { averageCumulative, cumulative, formatMm, seasonDayOffset, seasonLabel, summarize, todayIL } from "./seasons";

// Home-page card: the last measurement and how the season compares with the average up to today.
export async function RainSummary() {
  const days = await getDays();
  const sum = summarize(days);
  const today = todayIL();
  const off = seasonDayOffset(today);
  const rain = lastRain(days);
  const season = cumulative(days, sum.current)[off] ?? 0;
  const avg = averageCumulative(days, sum.complete.map((s) => s.season))[off] ?? 0;
  const pct = avg > 0 ? Math.round((season / avg) * 100) : null;

  return (
    <span className="flex flex-col gap-1">
      {rain && (
        <span className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums text-rain-deep">{formatMm(rain.day.mm)}</span>
          <span className="text-lg text-rain-deep">מ&quot;מ</span>
          <span className="text-muted">· המדידה האחרונה, {whenText(rain.day.date, today)}</span>
        </span>
      )}
      <span className="text-ink">
        {season > 0 ? (
          <>
            העונה ({seasonLabel(sum.current)}): <strong className="tabular-nums">{formatMm(season)} מ&quot;מ</strong>
            {pct !== null && <span className="text-muted"> · {pct}% מהממוצע עד היום</span>}
          </>
        ) : (
          <>עדיין לא ירד גשם בעונה {seasonLabel(sum.current)}.</>
        )}
      </span>
    </span>
  );
}
