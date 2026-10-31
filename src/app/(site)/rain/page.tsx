import Link from "next/link";
import { Card, DropIcon, Page } from "@/modules/rain/ui";
import { Hero } from "@/modules/rain/Hero";
import { getDays } from "@/modules/rain/data";
import { averageCumulative, cumulative, formatDate, formatMm, seasonDayOffset, seasonLabel, summarize, todayIL } from "@/modules/rain/seasons";

function Stat({
  label,
  value,
  sub,
  tone = "text-teal",
  icon = "drop",
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  tone?: string;
  icon?: "drop" | "up" | "down";
}) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-muted">{label}</h2>
        <p className={`mt-1 text-3xl font-bold tabular-nums ${tone}`}>{value}</p>
        {sub && <p className={`mt-0.5 ${tone}`}>{sub}</p>}
      </div>
      <span className="shrink-0 text-drop">
        {icon === "drop" ? (
          <DropIcon className="h-9 w-9" />
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {icon === "up" ? <path d="M3 17l6-6 4 4 8-8M15 7h6v6" /> : <path d="M3 7l6 6 4-4 8 8M15 17h6v-6" />}
          </svg>
        )}
      </span>
    </Card>
  );
}

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

export default async function Home() {
  const days = await getDays();
  const sum = summarize(days);
  const cur = sum.seasons.find((s) => s.season === sum.current);
  const last = sum.complete[sum.complete.length - 1];

  // Average rain up to today's point in the season, for comparison with the current season.
  const today = todayIL();
  const avgToDate = averageCumulative(days, sum.complete.map((s) => s.season))[seasonDayOffset(today)] ?? 0;
  const curTotal = cumulative(days, sum.current)[seasonDayOffset(today)] ?? 0;
  const lastToDate = cumulative(days, last.season)[seasonDayOffset(today)] ?? 0;
  const recent = days.filter((d) => d.mm > 0).slice(-6).reverse();

  return (
    <Page active={"/rain"}>
      <Hero
        days={days}
        today={today}
        season={sum.current}
        seasonTotal={curTotal}
        rainDays={cur?.rainDays ?? 0}
        lastSeasonToDate={lastToDate}
        averageToDate={avgToDate}
        averageSeason={sum.average}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat
          label="ממוצע שנתי"
          value={`${formatMm(sum.average)} מ"מ`}
          sub={`${sum.complete.length} עונות, מ-${sum.complete[0].label} עד ${last.label}`}
        />
        <Stat
          label={`העונה הקודמת (${last.label})`}
          value={`${formatMm(last.total)} מ"מ`}
          sub={`${pct(last.total, sum.average)}% מהממוצע · ${last.rainDays} ימי גשם`}
          tone="text-rain"
        />
        <Stat label="השנה הגשומה ביותר" value={sum.wettest.label} sub={`${formatMm(sum.wettest.total)} מ"מ`} icon="up" />
        <Stat label="השנה השחונה ביותר" value={sum.driest.label} sub={`${formatMm(sum.driest.total)} מ"מ`} tone="text-rain" icon="down" />
        <Stat
          label="היום הגשום ביותר"
          value={`${formatMm(sum.wettestDay.mm)} מ"מ`}
          sub={formatDate(sum.wettestDay.date)}
          tone="text-rain"
        />
      </div>

      <Card>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold">דיווחים אחרונים</h2>
          <Link href="/rain/daily" className="text-sm text-rain underline-offset-4 hover:underline">
            לכל הנתונים היומיים
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {recent.map((d) => (
            <li key={d.date} className="flex items-center justify-between py-2">
              <span>{formatDate(d.date)}</span>
              <span className="font-semibold tabular-nums text-teal">{formatMm(d.mm)} מ&quot;מ</span>
            </li>
          ))}
        </ul>
      </Card>
    </Page>
  );
}
