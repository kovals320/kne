import { APP_NAME, Frame, Tile } from "@/core/ui/Frame";
import { enabledModules } from "@/core/modules";

export default function Home() {
  return (
    <Frame>
      <h1 className="sr-only">{APP_NAME}</h1>
      <p className="mb-5 text-lg text-muted">ברוכים הבאים לאפליקציה של קיבוץ ניר אליהו.</p>
      <nav aria-label="אזורים באפליקציה" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {enabledModules().map((m) => (
          <Tile key={m.slug} m={m} />
        ))}
      </nav>
    </Frame>
  );
}
