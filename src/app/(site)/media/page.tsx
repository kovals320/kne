import { Frame } from "@/core/ui/Frame";
import Link from "next/link";
import { Suspense } from "react";
import { getYears } from "@/modules/media/immich";
import { AdminLink } from "@/modules/media/AdminLink";
import { Icon } from "@/core/ui/Icon";
import { loadVideos } from "./videos/loadVideos";

// Totals next to each tile; they follow the same caches as the pages
// (photos: hourly, videos: every 30 minutes, or right away with the admin refresh).
async function PhotoCount() {
  try {
    const years = await getYears();
    const total = years.reduce((n, y) => n + (y.count ?? 0), 0);
    return <Count n={total} className="text-ink/70" />;
  } catch {
    return null;
  }
}

async function VideoCount() {
  try {
    const { videos } = await loadVideos();
    return <Count n={videos.length} className="text-white/75" />;
  } catch {
    return null;
  }
}

function Count({ n, className }: { n: number; className: string }) {
  if (n <= 0) return null;
  return <span className={`text-xl font-semibold tabular-nums sm:text-2xl ${className}`}>{n.toLocaleString("he-IL")}</span>;
}

// Served from Vercel's cache and rebuilt in the background at most every 30 minutes
// (or right away after a change on the admin page), so it opens instantly.
export const revalidate = 1800;

export const metadata = { title: "מדיה" };

export default function Home() {

  return (
    <Frame active="media">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
          <span style={{ color: "#a4532a" }}>
            <Icon name="media" className="h-8 w-8" />
          </span>
          מדיה
        </h1>
        <AdminLink />
      </div>
      <nav
        aria-label="בחירת סוג מדיה"
        className="grid grid-cols-1 gap-4 sm:grid-cols-[1.15fr_1fr] sm:gap-5"
      >
        {/* Photos */}
        <Link
          href="/media/photos"
          className="group relative flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-sun p-6 transition-transform duration-200 active:scale-[0.98] sm:min-h-[26rem] sm:p-8"
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-6 flex justify-center sm:top-10">
            <div className="relative h-36 w-32 sm:h-48 sm:w-40">
              <div className="print-left absolute inset-0 rounded-md bg-print p-2 pb-7 shadow-[0_8px_20px_-8px_rgba(80,50,0,0.45)]">
                <div className="h-full w-full rounded-sm bg-[linear-gradient(160deg,#b9c98a,#6b8a46)]" />
              </div>
              <div className="print-right absolute inset-0 rounded-md bg-print p-2 pb-7 shadow-[0_8px_20px_-8px_rgba(80,50,0,0.45)]">
                <div className="h-full w-full rounded-sm bg-[linear-gradient(200deg,#f0d79a,#d4a85a)]" />
              </div>
              <div className="absolute inset-0 rounded-md bg-print p-2 pb-7 shadow-[0_10px_24px_-8px_rgba(80,50,0,0.5)] transition-transform duration-300 group-hover:-translate-y-1.5">
                <div className="h-full w-full rounded-sm bg-[linear-gradient(180deg,#bcd8e6,#8fb8cc_58%,#a9b86a_58%,#6f8f3e)]" />
              </div>
            </div>
          </div>
          <span className="flex items-baseline gap-3">
            <span className="font-display text-4xl text-ink sm:text-5xl">תמונות</span>
            <Suspense fallback={null}>
              <PhotoCount />
            </Suspense>
          </span>
        </Link>

        {/* Videos */}
        <Link
          href="/media/videos"
          className="group relative flex min-h-[15rem] flex-col justify-end overflow-hidden rounded-[2rem] bg-lake p-6 text-white transition-transform duration-200 active:scale-[0.98] sm:min-h-[26rem] sm:p-8"
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex h-7 items-center justify-around bg-lake-deep px-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="h-3 w-4 rounded-[3px] bg-paper/85" />
            ))}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-14 flex justify-center sm:top-20">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/30 transition-transform duration-300 group-hover:scale-105 sm:h-36 sm:w-36">
              <svg viewBox="0 0 24 24" className="h-12 w-12 translate-x-0.5 fill-white sm:h-14 sm:w-14">
                <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
              </svg>
            </div>
          </div>
          <span className="flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl">סרטים</span>
            <Suspense fallback={null}>
              <VideoCount />
            </Suspense>
          </span>
        </Link>
      </nav>
    </Frame>
  );
}
