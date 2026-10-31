"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/core/supabase/client";
import { signOut } from "@/app/actions";

type Me = { name: string; avatar: string | null; status: string; isSuper: boolean; pending: number };

// Sign-in button, or the signed-in person's menu. Checked in the browser, so public pages stay fast and cacheable;
// the admin pages themselves are checked again on the server.
export function UserMenu() {
  const [me, setMe] = useState<Me | null | undefined>(undefined); // undefined = still checking
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return setMe(null);
      const [{ data: p }, { data: roles }] = await Promise.all([
        supabase.from("kne_profiles").select("full_name, email, avatar_url, status").eq("id", user.id).maybeSingle(),
        supabase.from("kne_roles").select("section").eq("user_id", user.id),
      ]);
      const isSuper = p?.status === "approved" && (roles ?? []).some((r) => r.section === "*");
      let pending = 0;
      if (isSuper) {
        const { count } = await supabase.from("kne_profiles").select("id", { count: "exact", head: true }).eq("status", "pending");
        pending = count ?? 0;
      }
      setMe({
        name: p?.full_name?.trim() || (p?.email ?? user.email ?? "").split("@")[0],
        avatar: p?.avatar_url ?? null,
        status: p?.status ?? "pending",
        isSuper,
        pending,
      });
    })();
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  if (me === undefined) return <span className="h-10 w-10" aria-hidden />;
  if (me === null) {
    return (
      <Link href="/login" className="rounded-xl border-2 border-line px-3.5 py-1.5 font-semibold hover:bg-line/50">
        כניסה
      </Link>
    );
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`התפריט של ${me.name}`}
        className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-brand text-lg font-bold text-white"
      >
        {me.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={me.avatar} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          me.name.slice(0, 1)
        )}
        {me.pending > 0 && (
          <span className="absolute -left-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs text-white ring-2 ring-paper">
            {me.pending}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-40 w-60 rounded-2xl border border-line bg-card p-2 shadow-lg">
          <p className="truncate px-3 py-2 font-semibold">{me.name}</p>
          {me.status !== "approved" && (
            <Link href="/pending" className="block rounded-xl px-3 py-2 text-muted hover:bg-paper">
              {me.status === "blocked" ? "אין גישה" : "ממתין לאישור"}
            </Link>
          )}
          {me.isSuper && (
            <Link href="/admin/users" className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-paper">
              ניהול משתמשים
              {me.pending > 0 && <span className="rounded-full bg-red-600 px-2 text-sm text-white">{me.pending}</span>}
            </Link>
          )}
          <form action={signOut}>
            <button className="w-full rounded-xl px-3 py-2 text-start hover:bg-paper">יציאה</button>
          </form>
        </div>
      )}
    </div>
  );
}
