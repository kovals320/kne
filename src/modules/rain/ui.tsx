import Link from "next/link";
import { getViewer } from "@/core/auth";
import { Frame } from "@/core/ui/Frame";

export function DropIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={`${className} fill-none stroke-current`} strokeWidth={2.2} strokeLinejoin="round">
      <path d="M11 6c3 4.5 5.5 7.6 5.5 10.6a5.5 5.5 0 0 1-11 0C5.5 13.6 8 10.5 11 6z" />
      <path d="M22 11c2.6 3.8 4.6 6.4 4.6 9a4.6 4.6 0 0 1-9.2 0c0-2.6 2-5.2 4.6-9z" />
    </svg>
  );
}

// The rain section's own tabs (same order as the old rain site). Charts are turned off for now.
const TABS = [
  { href: "/rain", label: "עמוד ראשי" },
  { href: "/rain/about", label: "אודות" },
  { href: "/rain/daily", label: "נתונים יומיים" },
  { href: "/rain/monthly", label: "נתונים חודשיים" },
];

// A rain page inside the app frame: section title, tabs, then the page.
export async function Page({ active, children }: { active: string; children: React.ReactNode }) {
  const viewer = await getViewer();
  const isAdmin = viewer.isAdmin("rain");

  return (
    <Frame active="rain">
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
            <span className="text-rain">
              <DropIcon />
            </span>
            משקעים
          </h1>
          {isAdmin && (
            <Link
              href="/rain/admin"
              aria-current={active === "/rain/admin" ? "page" : undefined}
              className="rounded-full border-2 border-line px-3 py-1.5 text-sm font-medium hover:bg-sky aria-[current=page]:border-rain aria-[current=page]:text-rain"
            >
              עדכון נתונים
            </Link>
          )}
        </div>
        <nav aria-label="משקעים" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {TABS.map((t) => {
            const on = t.href === active;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`rounded-2xl px-3 py-3 text-center text-lg font-semibold transition-colors ${
                  on ? "bg-rain text-white shadow-sm" : "bg-sky text-ink hover:bg-rain/10"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </Frame>
  );
}

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`rounded-2xl border border-line bg-card px-5 py-5 shadow-sm ${className}`}>{children}</section>;
}
