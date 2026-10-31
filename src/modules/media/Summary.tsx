// Home-page card for media (still the separate site; a photo of the day can come once media moves in).
export function MediaSummary() {
  return (
    <span className="flex flex-col gap-2">
      <span className="text-muted">תמונות מכל השנים וסרטים מההיסטוריה של הקיבוץ.</span>
      <span className="flex gap-2">
        <span className="rounded-full bg-paper px-3 py-1 text-sm font-medium">תמונות</span>
        <span className="rounded-full bg-paper px-3 py-1 text-sm font-medium">סרטים</span>
      </span>
    </span>
  );
}
