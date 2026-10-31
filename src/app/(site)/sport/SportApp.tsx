"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createClient } from "@/core/supabase/client";
import {
  BOOKING_COLS,
  COURTS,
  DURATIONS,
  PARTICIPANT_COLS,
  START_TIMES,
  endTime,
  type Booking,
  type Court,
  type Participant,
} from "@/modules/sport/types";
import { deleteBooking, joinBooking, removeParticipant, saveBooking } from "./actions";

export type ViewerInfo = { userId: string | null; approved: boolean; pending: boolean; isAdmin: boolean };

const MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const DAY_LETTERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

const pad = (n: number) => String(n).padStart(2, "0");
const todayIL = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(new Date());
const monthKey = (y: number, m: number) => `${y}-${pad(m + 1)}`;
const weekday = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

type MonthData = { bookings: Booking[]; participants: Participant[] };

export function SportApp({ viewer }: { viewer: ViewerInfo }) {
  const today = todayIL();
  const [ym, setYm] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));
  const [selected, setSelected] = useState(today);
  const [cache, setCache] = useState<Record<string, MonthData>>({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<null | { booking?: Booking }>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async (y: number, m: number) => {
    const key = monthKey(y, m);
    const next = m === 11 ? monthKey(y + 1, 0) : monthKey(y, m + 1);
    const supabase = createClient();
    const { data: bookings } = await supabase
      .from("sport_court_bookings")
      .select(BOOKING_COLS)
      .gte("date", `${key}-01`)
      .lt("date", `${next}-01`);
    const ids = (bookings ?? []).map((b) => b.id);
    const { data: participants } = ids.length
      ? await supabase.from("sport_booking_participants").select(PARTICIPANT_COLS).in("booking_id", ids).order("id")
      : { data: [] };
    setCache((c) => ({ ...c, [key]: { bookings: (bookings ?? []) as Booking[], participants: (participants ?? []) as Participant[] } }));
  }, []);

  const refresh = useCallback(async () => {
    const keys = new Set([monthKey(ym.y, ym.m), selected.slice(0, 7)]);
    await Promise.all([...keys].map((k) => load(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1)));
  }, [load, selected, ym]);

  useEffect(() => {
    setLoading(true);
    load(ym.y, ym.m).finally(() => setLoading(false));
  }, [load, ym]);

  const month = cache[monthKey(ym.y, ym.m)];
  const dayData = cache[selected.slice(0, 7)];

  const byDay = useMemo(() => {
    const map: Record<string, Set<Court>> = {};
    for (const b of month?.bookings ?? []) (map[b.date] ??= new Set()).add(b.court_type);
    return map;
  }, [month]);

  const dayBookings = (dayData?.bookings ?? []).filter((b) => b.date === selected).sort((a, b) => a.start_time.localeCompare(b.start_time));

  function changeMonth(delta: number) {
    const d = new Date(Date.UTC(ym.y, ym.m + delta, 1));
    setYm({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  }

  const firstWeekday = new Date(Date.UTC(ym.y, ym.m, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate();
  const [sy, sm, sd] = selected.split("-").map(Number);

  async function done(r: { ok: boolean; message?: string }, okText: string) {
    setNotice({ ok: r.ok, text: r.ok ? okText : (r as { message: string }).message });
    if (r.ok) await refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar */}
      <section className="rounded-3xl border border-line bg-card p-4 shadow-sm sm:p-5" aria-label="לוח הזמנות">
        <div className="flex items-center justify-between">
          <button onClick={() => changeMonth(-1)} aria-label="החודש הקודם" className="rounded-xl px-3 py-2 text-2xl hover:bg-paper">
            ›
          </button>
          <h2 className="text-xl font-bold">
            {MONTHS[ym.m]} {ym.y}
          </h2>
          <button onClick={() => changeMonth(1)} aria-label="החודש הבא" className="rounded-xl px-3 py-2 text-2xl hover:bg-paper">
            ‹
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1.5 text-center text-sm text-muted">
          {DAY_LETTERS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className={`mt-1.5 grid grid-cols-7 gap-1.5 ${loading && !month ? "opacity-50" : ""}`}>
          {Array.from({ length: firstWeekday }, (_, i) => (
            <span key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = `${monthKey(ym.y, ym.m)}-${pad(day)}`;
            const courts = byDay[date];
            const both = courts?.has("tennis") && courts?.has("futsal");
            const one = courts && !both ? COURTS[[...courts][0]] : null;
            const isSel = date === selected;
            const past = date < today;
            return (
              <button
                key={date}
                onClick={() => {
                  setSelected(date);
                  setNotice(null);
                }}
                aria-pressed={isSel}
                aria-label={`${day} ב${MONTHS[ym.m]}${courts ? `, יש הזמנות` : ""}`}
                className={`relative flex h-12 items-center justify-center rounded-2xl text-base font-semibold transition-transform ${
                  isSel ? "scale-105 ring-4 ring-brand/30" : ""
                } ${past && !isSel ? "opacity-50" : ""} ${courts ? "text-white" : "bg-paper text-ink"}`}
                style={
                  both
                    ? { background: `linear-gradient(135deg, ${COURTS.tennis.color} 50%, ${COURTS.futsal.color} 50%)` }
                    : one
                      ? { backgroundColor: one.color }
                      : undefined
                }
              >
                {day}
                {date === today && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-current" aria-hidden />}
              </button>
            );
          })}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {(Object.keys(COURTS) as Court[]).map((c) => (
            <li key={c} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded" style={{ backgroundColor: COURTS[c].color }} aria-hidden />
              {COURTS[c].label}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded"
              style={{ background: `linear-gradient(135deg, ${COURTS.tennis.color} 50%, ${COURTS.futsal.color} 50%)` }}
              aria-hidden
            />
            שניהם
          </li>
        </ul>
      </section>

      {/* Selected day */}
      <section className="rounded-3xl border border-line bg-card p-4 shadow-sm sm:p-5" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">
            יום {DAYS[weekday(selected)]}, {sd} ב{MONTHS[sm - 1]}
            {selected === today && <span className="ms-2 text-base font-normal text-muted">(היום)</span>}
          </h2>
          {viewer.approved ? (
            <button
              onClick={() => {
                setForm({});
                setNotice(null);
              }}
              className="rounded-2xl bg-brand px-5 py-2.5 font-semibold text-white"
            >
              הזמנת מגרש
            </button>
          ) : viewer.userId ? (
            <span className="text-sm text-muted">{viewer.pending ? "החשבון ממתין לאישור מנהל" : "אין הרשאה להזמין"}</span>
          ) : (
            <Link href="/login?next=/sport" className="rounded-2xl border-2 border-brand px-4 py-2 font-semibold text-brand">
              כניסה כדי להזמין
            </Link>
          )}
        </div>

        {notice && (
          <p
            role={notice.ok ? "status" : "alert"}
            className={`mt-3 rounded-xl px-4 py-2.5 ${notice.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`}
          >
            {notice.text}
          </p>
        )}

        {!dayData ? (
          <p className="py-8 text-center text-muted">טוען…</p>
        ) : dayBookings.length === 0 ? (
          <p className="py-8 text-center text-muted">אין הזמנות ליום הזה.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {dayBookings.map((b) => (
              <BookingCard
                key={b.id}
                b={b}
                participants={dayData.participants.filter((p) => p.booking_id === b.id)}
                viewer={viewer}
                onEdit={() => {
                  setForm({ booking: b });
                  setNotice(null);
                }}
                onDone={done}
              />
            ))}
          </ul>
        )}
      </section>

      {form && (
        <BookingForm
          date={selected}
          dateLabel={`יום ${DAYS[weekday(selected)]}, ${sd} ב${MONTHS[sm - 1]} ${sy}`}
          booking={form.booking}
          onClose={() => setForm(null)}
          onSaved={async (text) => {
            setForm(null);
            await done({ ok: true }, text);
          }}
        />
      )}
    </div>
  );
}

function BookingCard({
  b,
  participants,
  viewer,
  onEdit,
  onDone,
}: {
  b: Booking;
  participants: Participant[];
  viewer: ViewerInfo;
  onEdit: () => void;
  onDone: (r: { ok: boolean; message?: string }, okText: string) => Promise<void>;
}) {
  const [pending, start] = useTransition();
  const court = COURTS[b.court_type] ?? COURTS.tennis;
  const mine = !!viewer.userId && b.booker_id === viewer.userId;
  const canEdit = viewer.approved && (mine || viewer.isAdmin);
  const max = b.max_participants || 10;
  const full = participants.length >= max;
  const myJoin = participants.find((p) => p.user_id && p.user_id === viewer.userId);

  return (
    <li className="rounded-2xl border border-line p-4" style={{ backgroundColor: court.soft }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="rounded-xl px-2.5 py-1 text-sm font-bold text-white" style={{ backgroundColor: court.color }}>
            {court.emoji} {court.label}
          </span>
          <span dir="ltr" className="text-lg font-bold tabular-nums">
            {b.start_time}–{endTime(b.start_time, b.duration_minutes)}
          </span>
        </span>
        <span className="font-semibold">
          {b.booker_name}
          {mine && <span className="ms-1 text-sm font-normal text-muted">(את/ה)</span>}
        </span>
      </div>

      {b.enable_registration && (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-white px-2.5 py-1 text-sm font-semibold">
              🎟️ נרשמו {participants.length} מתוך {max}
            </span>
            {viewer.approved &&
              (myJoin ? (
                <button
                  disabled={pending}
                  onClick={() => start(async () => onDone(await removeParticipant(myJoin.id), "ההשתתפות בוטלה."))}
                  className="rounded-xl border-2 border-line bg-white px-3 py-1 text-sm font-semibold disabled:opacity-50"
                >
                  ביטול השתתפות
                </button>
              ) : (
                <button
                  disabled={pending || full}
                  onClick={() => start(async () => onDone(await joinBooking(b.id), "נרשמת למשחק."))}
                  className="rounded-xl px-3 py-1 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: full ? "#94a3b8" : "#a34a0a" }}
                >
                  {full ? "מלא" : "הצטרפות"}
                </button>
              ))}
          </div>
          {participants.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {participants.map((p) => {
                const removable = viewer.approved && (mine || viewer.isAdmin) && p.user_id !== viewer.userId;
                return (
                  <li key={p.id} className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-0.5 text-sm">
                    {p.participant_name}
                    {removable && (
                      <button
                        aria-label={`הסרת ${p.participant_name}`}
                        disabled={pending}
                        onClick={() => {
                          if (confirm(`להסיר את ${p.participant_name} מהמשחק?`))
                            start(async () => onDone(await removeParticipant(p.id), "המשתתף הוסר."));
                        }}
                        className="text-muted hover:text-red-700"
                      >
                        ×
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {canEdit && (
        <div className="mt-3 flex gap-2">
          <button onClick={onEdit} className="rounded-xl border-2 border-line bg-white px-3 py-1 text-sm font-semibold">
            עריכה
          </button>
          <button
            disabled={pending}
            onClick={() => {
              if (confirm("למחוק את ההזמנה?")) start(async () => onDone(await deleteBooking(b.id), "ההזמנה נמחקה."));
            }}
            className="rounded-xl border-2 border-red-200 bg-white px-3 py-1 text-sm font-semibold text-red-800 disabled:opacity-50"
          >
            מחיקה
          </button>
        </div>
      )}
    </li>
  );
}

function BookingForm({
  date,
  dateLabel,
  booking,
  onClose,
  onSaved,
}: {
  date: string;
  dateLabel: string;
  booking?: Booking;
  onClose: () => void;
  onSaved: (text: string) => Promise<void>;
}) {
  const [court, setCourt] = useState<Court>(booking?.court_type ?? "tennis");
  const [start, setStart] = useState(booking?.start_time ?? "17:00");
  const [duration, setDuration] = useState(booking?.duration_minutes ?? 60);
  const [registration, setRegistration] = useState(!!booking?.enable_registration);
  const [max, setMax] = useState(booking?.max_participants && booking.enable_registration ? booking.max_participants : 10);
  const [error, setError] = useState<string | null>(null);
  const [pending, startT] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startT(async () => {
      const r = await saveBooking({ id: booking?.id, date, court, start, duration, registration, maxParticipants: max });
      if (r.ok) await onSaved(booking ? "ההזמנה עודכנה." : "המגרש הוזמן.");
      else setError(r.message);
    });
  }

  const field = "w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg outline-none focus:border-brand";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={booking ? "עריכת הזמנה" : "הזמנת מגרש"}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{booking ? "עריכת הזמנה" : "הזמנת מגרש"}</h2>
            <p className="text-muted">{dateLabel}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="סגירה" className="rounded-full p-2 text-xl text-muted hover:bg-paper">
            ×
          </button>
        </div>

        <fieldset className="mt-4">
          <legend className="font-semibold">סוג מגרש</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(COURTS) as Court[]).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={court === c}
                onClick={() => setCourt(c)}
                className="rounded-2xl border-2 px-4 py-3 text-lg font-bold"
                style={
                  court === c
                    ? { borderColor: COURTS[c].color, backgroundColor: COURTS[c].soft, color: COURTS[c].color }
                    : { borderColor: "var(--color-line)" }
                }
              >
                {COURTS[c].emoji} {COURTS[c].label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="font-semibold">שעת התחלה</span>
            <select value={start} onChange={(e) => setStart(e.target.value)} className={field} dir="ltr">
              {START_TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-semibold">משך</span>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={field}>
              {DURATIONS.map((d) => (
                <option key={d.minutes} value={d.minutes}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-2 text-muted">
          עד <span dir="ltr">{endTime(start, duration)}</span>
        </p>

        <label className="mt-4 flex items-center gap-3">
          <input type="checkbox" checked={registration} onChange={(e) => setRegistration(e.target.checked)} className="h-5 w-5 accent-brand" />
          <span className="font-semibold">פתוח להצטרפות של אחרים</span>
        </label>
        {registration && (
          <label className="mt-3 flex items-center gap-3">
            <span className="font-semibold">מספר מקומות</span>
            <input
              type="number"
              min={2}
              max={40}
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="w-24 rounded-2xl border-2 border-line bg-white px-3 py-2 text-lg"
            />
          </label>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-800">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className="mt-5 w-full rounded-2xl bg-brand px-5 py-3.5 text-lg font-semibold text-white disabled:opacity-60">
          {pending ? "שומר…" : booking ? "עדכון ההזמנה" : "אישור ההזמנה"}
        </button>
      </form>
    </div>
  );
}
