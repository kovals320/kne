"use server";

import { displayName, getViewer } from "@/core/auth";
import { START_TIMES, type Court } from "@/modules/sport/types";

export type Result = { ok: true } | { ok: false; message: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function friendly(message: string | undefined): string {
  if (message?.includes("sport_overlap")) return "המגרש כבר תפוס בחלק מהזמן הזה. בחרו שעה אחרת.";
  if (message?.includes("sport_full")) return "ההרשמה מלאה.";
  if (message?.includes("sport_no_registration")) return "במשחק הזה אין הרשמה.";
  if (message?.includes("duplicate")) return "כבר נרשמת למשחק הזה.";
  return "הפעולה לא הצליחה. נסו שוב.";
}

async function member() {
  const viewer = await getViewer();
  if (!viewer.user || !viewer.profile) return { error: "צריך להיכנס כדי לבצע פעולה." } as const;
  if (!viewer.isApproved) return { error: "החשבון שלך עדיין ממתין לאישור מנהל." } as const;
  return { viewer } as const;
}

// Create (no id) or change a booking. The database checks again: only the booker or a sport admin may change it,
// and no two bookings may overlap on the same court.
export async function saveBooking(input: {
  id?: number;
  date: string;
  court: Court;
  start: string;
  duration: number;
  registration: boolean;
  maxParticipants: number;
}): Promise<Result> {
  const m = await member();
  if ("error" in m) return { ok: false, message: m.error! };
  const { viewer } = m;
  if (!DATE_RE.test(input.date)) return { ok: false, message: "תאריך לא תקין." };
  if (!["tennis", "futsal"].includes(input.court)) return { ok: false, message: "סוג מגרש לא תקין." };
  if (!START_TIMES.includes(input.start)) return { ok: false, message: "שעה לא תקינה." };
  if (![30, 60, 90, 120].includes(input.duration)) return { ok: false, message: "משך לא תקין." };
  const max = Math.min(40, Math.max(2, Math.round(input.maxParticipants || 10)));

  const row = {
    date: input.date,
    court_type: input.court,
    start_time: input.start,
    duration_minutes: input.duration,
    enable_registration: input.registration,
    max_participants: input.registration ? max : 6,
  };
  const { error } = input.id
    ? await viewer.supabase.from("sport_court_bookings").update(row).eq("id", input.id)
    : await viewer.supabase
        .from("sport_court_bookings")
        .insert({ ...row, booker_id: viewer.user!.id, booker_name: displayName(viewer.profile!) });
  return error ? { ok: false, message: friendly(error.message) } : { ok: true };
}

export async function deleteBooking(id: number): Promise<Result> {
  const m = await member();
  if ("error" in m) return { ok: false, message: m.error! };
  const { error, count } = await m.viewer.supabase.from("sport_court_bookings").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, message: friendly(error.message) };
  return count ? { ok: true } : { ok: false, message: "אפשר למחוק רק הזמנה שלך." };
}

export async function joinBooking(bookingId: number): Promise<Result> {
  const m = await member();
  if ("error" in m) return { ok: false, message: m.error! };
  const { error } = await m.viewer.supabase
    .from("sport_booking_participants")
    .insert({ booking_id: bookingId, user_id: m.viewer.user!.id, participant_name: displayName(m.viewer.profile!) });
  return error ? { ok: false, message: friendly(error.message) } : { ok: true };
}

// Remove a participant: yourself, or (for the booker / a sport admin) anyone.
export async function removeParticipant(participantId: number): Promise<Result> {
  const m = await member();
  if ("error" in m) return { ok: false, message: m.error! };
  const { error, count } = await m.viewer.supabase
    .from("sport_booking_participants")
    .delete({ count: "exact" })
    .eq("id", participantId);
  if (error) return { ok: false, message: friendly(error.message) };
  return count ? { ok: true } : { ok: false, message: "אין הרשאה להסיר את המשתתף הזה." };
}
