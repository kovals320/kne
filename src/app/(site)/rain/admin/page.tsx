import { Card, Page } from "@/modules/rain/ui";
import { displayName, requireAdmin } from "@/core/auth";
import { getDays } from "@/modules/rain/data";
import { formatDate, formatMm, seasonLabel, summarize, todayIL } from "@/modules/rain/seasons";
import { DeleteButton, ReadingForm } from "./AdminForm";

export const metadata = { title: "עדכון נתונים – משקעים" };

export default async function AdminPage() {
  const { profile } = await requireAdmin("rain", "/rain/admin");
  const days = await getDays();
  const sum = summarize(days);
  const recent = days.slice(-20).reverse();
  const cur = sum.seasons.find((s) => s.season === sum.current);

  return (
    <Page active={"/rain/admin"}>
      <Card>
        <h2 className="text-2xl font-bold">עדכון נתונים</h2>
        <p className="mt-1 text-muted">
          שלום {displayName(profile)}. מוסיפים את כמות הגשם של יום אחד. אם כבר יש דיווח לאותו תאריך, הוא יוחלף.
          אפשר לרשום גם 0.
        </p>
        <ReadingForm today={todayIL()} />
      </Card>

      <Card>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold">דיווחים אחרונים</h2>
          <span className="text-sm text-muted">
            עונה {seasonLabel(sum.current)}: {cur ? `${formatMm(cur.total)} מ"מ` : "אין עדיין דיווחים"}
          </span>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {recent.map((d) => (
            <li key={d.date} className="flex items-center justify-between gap-3 py-2">
              <span className="tabular-nums">{formatDate(d.date)}</span>
              <span className="ms-auto font-semibold tabular-nums text-teal">{formatMm(d.mm)} מ&quot;מ</span>
              <DeleteButton date={d.date} label={formatDate(d.date)} />
            </li>
          ))}
        </ul>
      </Card>
    </Page>
  );
}
