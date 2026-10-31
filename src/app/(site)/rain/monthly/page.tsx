import { Card, Page } from "@/modules/rain/ui";
import { getDays } from "@/modules/rain/data";
import { SEASON_MONTHS, formatMm, monthLabel, summarize } from "@/modules/rain/seasons";

export const metadata = { title: "נתונים חודשיים – משקעים" };

// Light blue behind each month cell, darker for more rain (capped at 300 mm).
// Kept light enough that the dark text stays readable (contrast above 4.5:1 at the darkest shade).
function shade(mm: number) {
  if (mm <= 0) return undefined;
  const a = Math.min(1, mm / 300) * 0.5 + 0.06;
  return { backgroundColor: `rgba(37, 99, 235, ${a.toFixed(3)})` };
}

const cell = (mm: number | undefined) => (mm && mm > 0 ? formatMm(mm) : "–");

export default async function MonthlyPage() {
  const days = await getDays();
  const sum = summarize(days);
  const rows = [...sum.seasons].reverse();

  return (
    <Page active={"/rain/monthly"}>
      <Card>
        <h2 className="text-2xl font-bold">נתונים חודשיים</h2>
        <p className="mt-1 text-muted">
          כמות הגשם בכל חודש, לפי עונות. עונה נמשכת מספטמבר עד מאי; גשם שירד ביוני–אוגוסט נספר לעונה שמתחילה בספטמבר שאחריו.
          ככל שהמשבצת כהה יותר, ירד יותר גשם.
        </p>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-sm">
        <table className="w-full min-w-[56rem] border-collapse text-sm tabular-nums">
          <thead>
            <tr className="border-b border-line bg-sky text-muted">
              <th scope="col" className="sticky right-0 z-10 bg-sky px-3 py-2.5 text-start font-semibold">
                עונה
              </th>
              {SEASON_MONTHS.map((k) => (
                <th key={String(k)} scope="col" className="px-2 py-2.5 text-center font-semibold">
                  {monthLabel(k, true)}
                </th>
              ))}
              <th scope="col" className="px-3 py-2.5 text-center font-semibold text-ink">
                סה&quot;כ
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b-2 border-line bg-aqua/60 font-semibold">
              <th scope="row" className="sticky right-0 z-10 bg-aqua px-3 py-2 text-start">
                ממוצע
              </th>
              {SEASON_MONTHS.map((k) => (
                <td key={String(k)} className="px-2 py-2 text-center">
                  {cell(sum.monthAverages[String(k)])}
                </td>
              ))}
              <td className="px-3 py-2 text-center text-teal">{formatMm(sum.average)}</td>
            </tr>
            {rows.map((s) => {
              const record = s.season === sum.wettest.season ? "הגשומה ביותר" : s.season === sum.driest.season ? "השחונה ביותר" : null;
              const ongoing = s.season === sum.current;
              return (
                <tr key={s.season} className="border-b border-line last:border-0">
                  <th scope="row" className="sticky right-0 z-10 bg-card px-3 py-1.5 text-start font-semibold">
                    {s.label}
                    {ongoing && <span className="ms-1.5 text-xs font-normal text-muted">(נוכחית)</span>}
                  </th>
                  {SEASON_MONTHS.map((k) => {
                    const mm = s.months[String(k)] ?? 0;
                    return (
                      <td key={String(k)} className="px-2 py-1.5 text-center" style={shade(mm)}>
                        {cell(mm)}
                      </td>
                    );
                  })}
                  <td className="px-3 py-1.5 text-center font-bold" title={record ?? undefined}>
                    {formatMm(s.total)}
                    {record && <span className="ms-1 text-xs font-normal text-muted">({record})</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Page>
  );
}
