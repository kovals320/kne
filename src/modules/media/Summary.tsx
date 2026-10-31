import { getYears, type YearSummary } from "./immich";

const Fallback = () => <span className="text-muted">תמונות מכל השנים וסרטים מההיסטוריה של הקיבוץ.</span>;

// Home-page card for media: a cover photo from a different year each day, and how many photos there are.
// Uses the same hourly Immich cache as the media pages; without the Immich keys it shows plain text.
export async function MediaSummary() {
  let years: YearSummary[] = [];
  try {
    years = (await getYears()).filter((y) => y.coverId);
  } catch {
    return <Fallback />;
  }
  if (years.length === 0) return <Fallback />;

  const day = Math.floor(Date.now() / 86_400_000);
  const pick = years[day % years.length];
  const total = years.reduce((n, y) => n + (y.count ?? 0), 0);

  return (
    <span className="flex items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/media/photo/${pick.coverId}/thumb`}
        alt=""
        loading="lazy"
        className="h-20 w-20 shrink-0 -rotate-2 rounded-lg bg-print object-cover p-1 shadow-md"
      />
      <span className="flex flex-col">
        <span className="font-semibold">תמונה מ-{pick.year}</span>
        <span className="text-muted">
          {total.toLocaleString("he-IL")} תמונות מ-{years.length} שנים, וגם סרטים
        </span>
      </span>
    </span>
  );
}
