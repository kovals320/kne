import Link from "next/link";
import { enabledModules, isExternal, type Module } from "@/core/modules";
import { Icon } from "./Icon";

export const APP_NAME = "ניר אליהו";

function ModuleLink({ m, className, children }: { m: Module; className: string; children: React.ReactNode }) {
  // Sections that still live in their old site are plain links to it (same tab).
  return isExternal(m) ? (
    <a href={m.href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={m.href} className={className}>
      {children}
    </Link>
  );
}

// Header on every page, a bottom tab bar on phones, and the page content between them.
export function Frame({ active, children }: { active?: string; children: React.ReactNode }) {
  const modules = enabledModules();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2} strokeLinecap="round">
                <circle cx="12" cy="9" r="3.4" fill="#f4c95d" stroke="#f4c95d" />
                <path d="M4 16h16M6.5 19.5h11" />
              </svg>
            </span>
            <span className="text-2xl font-bold">{APP_NAME}</span>
          </Link>
          {/* Desktop menu */}
          <nav aria-label="תפריט" className="hidden items-center gap-1 sm:flex">
            {modules.map((m) => (
              <ModuleLink
                key={m.slug}
                m={m}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 font-medium transition-colors hover:bg-line/60 ${
                  active === m.slug ? "bg-line/70" : ""
                }`}
              >
                <span style={{ color: m.accent }}>
                  <Icon name={m.icon} className="h-5 w-5" />
                </span>
                {m.name}
              </ModuleLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:pb-10">{children}</main>

      {/* Phone tab bar */}
      <nav
        aria-label="תפריט"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
      >
        <ul className="mx-auto grid max-w-md" style={{ gridTemplateColumns: `repeat(${modules.length + 1}, minmax(0, 1fr))` }}>
          <li>
            <Link
              href="/"
              aria-current={!active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-sm font-medium ${!active ? "text-brand" : "text-muted"}`}
            >
              <Icon name="home" className="h-6 w-6" />
              בית
            </Link>
          </li>
          {modules.map((m) => (
            <li key={m.slug}>
              <ModuleLink
                m={m}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-sm font-medium ${active === m.slug ? "" : "text-muted"}`}
              >
                <span style={active === m.slug ? { color: m.accent } : undefined}>
                  <Icon name={m.icon} className="h-6 w-6" />
                </span>
                <span style={active === m.slug ? { color: m.accent } : undefined}>{m.shortName}</span>
              </ModuleLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function Tile({ m }: { m: Module }) {
  return (
    <ModuleLink
      m={m}
      className="group flex items-center gap-4 rounded-3xl border border-line bg-card p-5 shadow-sm transition-transform active:scale-[0.98] sm:flex-col sm:items-start sm:p-6"
    >
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl" style={{ backgroundColor: m.tint, color: m.accent }}>
        <Icon name={m.icon} className="h-9 w-9" />
      </span>
      <span className="min-w-0">
        <span className="block text-xl font-bold">{m.name}</span>
        <span className="mt-0.5 block text-muted">{m.description}</span>
      </span>
      <span aria-hidden className="ms-auto text-2xl text-muted transition-transform group-hover:-translate-x-1 sm:hidden">
        ‹
      </span>
    </ModuleLink>
  );
}
