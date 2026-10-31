import { getDayBookings } from "./today";
import { COURTS, endTime } from "./types";

const todayIL = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
const nowIL = () => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", hour: "2-digit", minute: "2-digit" }).format(new Date());

// Home-page card: today's bookings that haven't ended yet.
export async function SportSummary() {
  let bookings: Awaited<ReturnType<typeof getDayBookings>> = [];
  try {
    bookings = await getDayBookings(todayIL());
  } catch {
    return null;
  }
  const now = nowIL();
  const upcoming = bookings.filter((b) => endTime(b.start_time, b.duration_minutes) > now);

  if (upcoming.length === 0) {
    return <span className="text-muted">{bookings.length ? "ההזמנות של היום הסתיימו. המגרשים פנויים." : "אין הזמנות היום. המגרשים פנויים."}</span>;
  }
  return (
    <span className="flex flex-col gap-1.5">
      <span className="text-muted">היום:</span>
      {upcoming.slice(0, 4).map((b) => {
        const c = COURTS[b.court_type] ?? COURTS.tennis;
        return (
          <span key={b.id} className="flex items-center gap-2">
            <span className="rounded-lg px-2 py-0.5 text-sm font-bold text-white" style={{ backgroundColor: c.color }}>
              {c.emoji} {c.label}
            </span>
            <span dir="ltr" className="font-semibold tabular-nums">
              {b.start_time}–{endTime(b.start_time, b.duration_minutes)}
            </span>
            <span className="truncate text-muted">{b.booker_name}</span>
          </span>
        );
      })}
      {upcoming.length > 4 && <span className="text-sm text-muted">ועוד {upcoming.length - 4}</span>}
    </span>
  );
}
