"use client";

import { useTransition } from "react";
import { setRole, setStatus } from "./actions";

const tones = {
  primary: "bg-brand text-white",
  danger: "border-2 border-red-200 text-red-800 hover:bg-red-50",
  plain: "border-2 border-line hover:bg-paper",
};

export function StatusButton({
  userId,
  status,
  label,
  tone,
  confirm: ask,
}: {
  userId: string;
  status: "approved" | "blocked";
  label: string;
  tone: keyof typeof tones;
  confirm?: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (ask && !confirm(`ל${label}? האדם לא יוכל יותר לבצע פעולות באפליקציה.`)) return;
        start(() => setStatus(userId, status));
      }}
      className={`rounded-xl px-4 py-2 font-semibold disabled:opacity-50 ${tones[tone]}`}
    >
      {pending ? "…" : label}
    </button>
  );
}

export function RoleToggle({
  userId,
  section,
  label,
  on,
  locked,
}: {
  userId: string;
  section: string;
  label: string;
  on: boolean;
  locked?: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={pending || locked}
      title={locked ? "אי אפשר להסיר את עצמך מניהול האפליקציה" : undefined}
      onClick={() => start(() => setRole(userId, section, !on))}
      className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
        on ? "border-brand bg-brand text-white" : "border-line text-ink hover:bg-paper"
      } ${pending ? "opacity-60" : ""}`}
    >
      <span aria-hidden>{on ? "✓" : "+"}</span>
      מנהל/ת {label}
    </button>
  );
}
