import type { IconName } from "@/core/modules";

// Simple line icons, drawn in the current text colour.
export function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  const common = {
    "aria-hidden": true,
    className: `${className} fill-none stroke-current`,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 11l8-7 8 7" />
          <path d="M6 10v9h12v-9" />
          <path d="M10 19v-5h4v5" />
        </svg>
      );
    case "rain":
      return (
        <svg viewBox="0 0 32 32" {...common} strokeWidth={2.2}>
          <path d="M11 6c3 4.5 5.5 7.6 5.5 10.6a5.5 5.5 0 0 1-11 0C5.5 13.6 8 10.5 11 6z" />
          <path d="M22 11c2.6 3.8 4.6 6.4 4.6 9a4.6 4.6 0 0 1-9.2 0c0-2.6 2-5.2 4.6-9z" />
        </svg>
      );
    case "media":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="M21 16l-5-5-8 8" />
        </svg>
      );
    case "sport":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M5.5 6.5c3 2.5 3 8.5 0 11M18.5 6.5c-3 2.5-3 8.5 0 11" />
        </svg>
      );
  }
}
