"use client";

import { useRouter } from "next/navigation";

export function SeasonPicker({ seasons, value }: { seasons: { season: number; label: string }[]; value: number }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2">
      <span className="font-medium">עונה</span>
      <select
        value={value}
        onChange={(e) => router.push(`/rain/daily?season=${e.target.value}`)}
        className="rounded-xl border border-line bg-card px-3 py-2 text-lg tabular-nums outline-none focus:border-rain"
      >
        {seasons.map((s) => (
          <option key={s.season} value={s.season}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
