"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/core/auth";

export type FormState = { ok: boolean; message: string } | null;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Add or update one day's reading. Writing is allowed only for admins (enforced again by the table's RLS).
export async function saveReading(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin("rain", "/rain/admin");
  const date = String(form.get("date") ?? "");
  const raw = String(form.get("mm") ?? "").trim().replace(",", ".");
  const mm = Number(raw);

  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date))) return { ok: false, message: "התאריך לא תקין." };
  if (raw === "" || !Number.isFinite(mm) || mm < 0 || mm > 999.9) return { ok: false, message: "כמות הגשם צריכה להיות מספר בין 0 ל-999.9." };

  const { error } = await supabase
    .from("rain_daily")
    .upsert({ date, rainfall_mm: Math.round(mm * 10) / 10, updated_at: new Date().toISOString() }, { onConflict: "date" });
  if (error) return { ok: false, message: "השמירה נכשלה. נסו שוב." };

  updateTag("rain");
  const [y, m, d] = date.split("-");
  return { ok: true, message: `נשמר: ${Number(d)}.${Number(m)}.${y}, ${(Math.round(mm * 10) / 10).toFixed(1)} מ"מ.` };
}

export async function deleteReading(date: string) {
  const { supabase } = await requireAdmin("rain", "/rain/admin");
  if (!DATE_RE.test(date)) return;
  await supabase.from("rain_daily").delete().eq("date", date);
  updateTag("rain");
}
