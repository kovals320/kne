import { displayName, requireSuper, type Profile } from "@/core/auth";
import { MODULES } from "@/core/modules";
import { Frame } from "@/core/ui/Frame";
import { RoleToggle, StatusButton } from "./Buttons";

export const metadata = { title: "ניהול משתמשים" };

type Row = Profile & { created_at: string };

const dateFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric", year: "numeric", timeZone: "Asia/Jerusalem" });

function Person({ p }: { p: Row }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-lg font-bold text-white">
        {p.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatar_url} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          displayName(p).slice(0, 1)
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{displayName(p)}</span>
        <span dir="ltr" className="block truncate text-end text-sm text-muted">
          {p.email}
        </span>
      </span>
    </div>
  );
}

export default async function UsersPage() {
  const { supabase, user } = await requireSuper("/admin/users");
  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase.from("kne_profiles").select("id, email, full_name, avatar_url, status, created_at").order("created_at", { ascending: false }),
    supabase.from("kne_roles").select("user_id, section"),
  ]);
  const rows = (profiles ?? []) as Row[];
  const has = (id: string, section: string) => (roles ?? []).some((r) => r.user_id === id && r.section === section);
  const pending = rows.filter((p) => p.status === "pending");
  const approved = rows.filter((p) => p.status === "approved");
  const blocked = rows.filter((p) => p.status === "blocked");

  return (
    <Frame>
      <h1 className="text-2xl font-bold">ניהול משתמשים</h1>

      <section className="mt-5" aria-labelledby="pending-h">
        <h2 id="pending-h" className="text-xl font-bold">
          ממתינים לאישור {pending.length > 0 && <span className="text-red-700">({pending.length})</span>}
        </h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-muted">אין בקשות חדשות.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4">
                <Person p={p} />
                <span className="text-sm text-muted">נרשם/ה {dateFmt.format(new Date(p.created_at))}</span>
                <span className="flex gap-2">
                  <StatusButton userId={p.id} status="approved" label="אישור" tone="primary" />
                  <StatusButton userId={p.id} status="blocked" label="דחייה" tone="danger" />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8" aria-labelledby="approved-h">
        <h2 id="approved-h" className="text-xl font-bold">
          מאושרים ({approved.length})
        </h2>
        <p className="mt-1 text-muted">סמנו מי מנהל כל אזור. &quot;כל האפליקציה&quot; כולל גם אישור משתמשים.</p>
        <ul className="mt-3 flex flex-col gap-3">
          {approved.map((p) => (
            <li key={p.id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Person p={p} />
                {p.id !== user.id && <StatusButton userId={p.id} status="blocked" label="חסימה" tone="danger" confirm />}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <RoleToggle userId={p.id} section="*" label="כל האפליקציה" on={has(p.id, "*")} locked={p.id === user.id} />
                {MODULES.map((m) => (
                  <RoleToggle key={m.slug} userId={p.id} section={m.slug} label={m.name} on={has(p.id, m.slug)} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {blocked.length > 0 && (
        <section className="mt-8" aria-labelledby="blocked-h">
          <h2 id="blocked-h" className="text-xl font-bold">
            חסומים ({blocked.length})
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {blocked.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4">
                <Person p={p} />
                <StatusButton userId={p.id} status="approved" label="אישור בכל זאת" tone="plain" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Frame>
  );
}
