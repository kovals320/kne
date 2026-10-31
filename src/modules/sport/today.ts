import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { BOOKING_COLS, type Booking } from "./types";

// Bookings for one day (public data). Cached for a minute; booking actions clear it at once (tag "sport").
export const getDayBookings = unstable_cache(
  async (date: string): Promise<Booking[]> => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false },
    });
    const { data } = await supabase.from("sport_court_bookings").select(BOOKING_COLS).eq("date", date).order("start_time");
    return (data ?? []) as Booking[];
  },
  ["sport-day-v1"],
  { tags: ["sport"], revalidate: 60 },
);
