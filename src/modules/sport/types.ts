export type Court = "tennis" | "futsal";

export type Booking = {
  id: number;
  date: string; // YYYY-MM-DD
  court_type: Court;
  start_time: string; // HH:MM
  duration_minutes: number;
  booker_name: string;
  booker_id: string | null;
  enable_registration: boolean | null;
  max_participants: number | null;
};

export type Participant = {
  id: number;
  booking_id: number;
  participant_name: string;
  user_id: string | null;
};

export const COURTS: Record<Court, { label: string; emoji: string; color: string; soft: string }> = {
  tennis: { label: "טניס", emoji: "🎾", color: "#1d4fc4", soft: "#e6eefc" },
  futsal: { label: "קטרגל", emoji: "⚽", color: "#047857", soft: "#e3f5ee" },
};

export const DURATIONS = [
  { minutes: 30, label: "חצי שעה" },
  { minutes: 60, label: "שעה" },
  { minutes: 90, label: "שעה וחצי" },
  { minutes: 120, label: "שעתיים" },
];

// 06:00 … 22:00 every half hour (same as the old site).
export const START_TIMES = Array.from({ length: 33 }, (_, i) => {
  const m = 6 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});

export function endTime(start: string, minutes: number) {
  const [h, m] = start.split(":").map(Number);
  const t = h * 60 + m + minutes;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

export const BOOKING_COLS = "id,date,court_type,start_time,duration_minutes,booker_name,booker_id,enable_registration,max_participants";
export const PARTICIPANT_COLS = "id,booking_id,participant_name,user_id";
