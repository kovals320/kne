import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export type Day = {
  date: string; // YYYY-MM-DD
  mm: number;
  season: number; // season_start: 2025 = 25/26 (Jun 2025 - May 2026)
};

// All daily readings, oldest first. The table is public (read-only for visitors), so the publishable key is enough.
// Supabase returns at most 1000 rows per request, so read in pages.
async function fetchAllDays(): Promise<Day[]> {
  // Local testing without Supabase access: RAIN_FIXTURE points to a JSON file of {date, mm, season}.
  if (process.env.RAIN_FIXTURE) {
    const { readFile } = await import("node:fs/promises");
    return JSON.parse(await readFile(process.env.RAIN_FIXTURE, "utf8")) as Day[];
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } },
  );
  const out: Day[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await supabase
      .from("rain_daily")
      .select("date, rainfall_mm, season_start")
      .order("date")
      .range(from, from + page - 1);
    if (error) throw new Error(error.message);
    for (const r of data ?? []) {
      out.push({ date: r.date as string, mm: Number(r.rainfall_mm), season: Number(r.season_start) });
    }
    if (!data || data.length < page) break;
  }
  return out;
}

// Cached for an hour; the admin page clears it right away after a change (tag "rain").
export const getDays = unstable_cache(fetchAllDays, ["rain-days-v1"], { tags: ["rain"], revalidate: 3600 });
