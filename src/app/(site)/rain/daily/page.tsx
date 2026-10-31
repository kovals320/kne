import Link from "next/link";
import { Card, Page } from "@/modules/rain/ui";
import { getDays } from "@/modules/rain/data";
import { MONTHS_HE, formatDate, formatMm, seasonLabel, summarize } from "@/modules/rain/seasons";
import { SeasonPicker } from "./SeasonPicker";

export const metadata = { title: "נתונים יומיים – משקעים" };

const WEEKDAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const weekday = (date: string) => WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];

export default async function DailyPage({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
  const days = await getDays();
  const sum = summarize(days);
  const withRain = sum.seasons.filter((s) => s.rainDays > 0);

  // Default: the current season if it has reports, otherwise the latest season that does.
  const requested = Number((await searchParams).season);
  const fallback = withRain[withRain.length - 1].season;
  const season = withRain.some((s) => s.season === requested) ? requested : fallback;
  const info = withRain.find((s) => s.season === season)!;
  const curEmpty = !withRain.some((s) => s.season === sum.current);

  const list = days.filter((d) => d.season === season && d.mm > 0);
  const byMonth: { key: string; month: number; year: number; days: typeof list; total: number }[] = [];
  let running = 0;
  const runningAt = new Map<string, number>();
  for (const d of list) {
    running += d.mm;
    runningAt.set(d.date, Math.round(running * 10) / 10);
    const key = d.date.slice(0, 7);
    let g = byMonth[byMonth.length - 1];
    if (!g || g.key !== key) {
      g = { key, month: Number(d.date.slice(5, 7)), year: Number(d.date.slice(0, 4)), days: [], total: 0 };
      byMonth.push(g);
    }
    g.days.push(d);
    g.total = Math.round((g.total + d.mm) * 10) / 10;
  }
  const scale = Math.max(40, ...list.map((d) => d.mm));
  const idx = withRain.findIndex((s) => s.season === season);
  const prev = withRain[idx - 1];
  const next = withRain[idx + 1];

  return (
    <Page active={"/rain/daily"}>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">נתונים יומיים</h2>
          <SeasonPicker seasons={[...withRain].reverse().map((s) => ({ season: s.season, label: s.label }))} value={season} />
        </div>
        {curEmpty && !requested && (
          <p className="mt-2 text-muted">עדיין אין דיווחים לעונה {seasonLabel(sum.current)}, אז מוצגת העונה האחרונה.</p>
        )}
        <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-sky px-2 py-3">
            <dt className="text-sm text-muted">סה&quot;כ בעונה</dt>
            <dd className="text-xl font-bold tabular-nums text-teal">{formatMm(info.total)}</dd>
          </div>
          <div className="rounded-xl bg-sky px-2 py-3">
            <dt className="text-sm text-muted">ימי גשם</dt>
            <dd className="text-xl font-bold tabular-nums text-rain">{info.rainDays}</dd>
          </div>
          <div className="rounded-xl bg-sky px-2 py-3">
            <dt className="text-sm text-muted">היום הגשום</dt>
            <dd className="text-xl font-bold tabular-nums text-rain">{info.maxDay ? formatMm(info.maxDay.mm) : "–"}</dd>
            {info.maxDay && <dd className="text-xs text-muted">{formatDate(info.maxDay.date)}</dd>}
          </div>
        </dl>
      </Card>

      {byMonth.map((g) => (
        <Card key={g.key} className="px-4 py-4 sm:px-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold">
              {MONTHS_HE[g.month - 1]} {g.year}
            </h2>
            <span className="font-semibold tabular-nums text-teal">{formatMm(g.total)} מ&quot;מ</span>
          </div>
          <ul className="mt-2">
            {g.days.map((d) => (
              <li key={d.date} className="grid grid-cols-[5.5rem_1fr_3.5rem] items-center gap-3 py-1.5 sm:grid-cols-[7rem_1fr_4rem_6rem]">
                <span className="tabular-nums">
                  <span className="text-muted">{weekday(d.date)}</span> {formatDate(d.date).slice(0, -5)}
                </span>
                <span className="h-2.5 rounded-full bg-sky">
                  <span className="block h-full rounded-full bg-rain" style={{ width: `${Math.max(2, (d.mm / scale) * 100)}%` }} />
                </span>
                <span className="text-end font-semibold tabular-nums">{formatMm(d.mm)}</span>
                <span className="hidden text-end text-sm tabular-nums text-muted sm:block">מצטבר {formatMm(runningAt.get(d.date)!)}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <nav className="flex justify-between gap-3" aria-label="מעבר בין עונות">
        {prev ? (
          <Link href={`/rain/daily?season=${prev.season}`} className="rounded-xl bg-card px-4 py-2.5 shadow-sm hover:bg-sky">
            → עונה קודמת ({prev.label})
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/rain/daily?season=${next.season}`} className="rounded-xl bg-card px-4 py-2.5 shadow-sm hover:bg-sky">
            עונה הבאה ({next.label}) ←
          </Link>
        )}
      </nav>
    </Page>
  );
}
