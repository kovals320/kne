"use client";

import { useActionState, useTransition } from "react";
import { deleteReading, saveReading, type FormState } from "./actions";

const input =
  "w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-lg tabular-nums outline-none transition-colors focus:border-rain";

export function ReadingForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveReading, null);

  return (
    <form action={action} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">תאריך</span>
        <input type="date" name="date" required defaultValue={today} max={today} dir="ltr" className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">כמות (מ&quot;מ)</span>
        <input
          type="text"
          name="mm"
          required
          inputMode="decimal"
          pattern="[0-9]+([.,][0-9])?"
          placeholder="לדוגמה 12.5"
          dir="ltr"
          className={input}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-2xl bg-rain px-6 py-3.5 text-lg font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "שומר…" : "שמירה"}
      </button>
      {state && (
        <p
          role={state.ok ? "status" : "alert"}
          className={`rounded-xl px-4 py-3 sm:col-span-3 ${state.ok ? "bg-aqua text-teal" : "bg-red-50 text-red-800"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

export function DeleteButton({ date, label }: { date: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`למחוק את הדיווח של ${label}?`)) start(() => deleteReading(date));
      }}
      className="rounded-full px-3 py-1 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "מוחק…" : "מחיקה"}
    </button>
  );
}
