import { Suspense } from "react";
import { APP_NAME, Frame, SummaryCard } from "@/core/ui/Frame";
import { enabledModules } from "@/core/modules";
import { SUMMARIES } from "@/modules/summaries";

// Refreshed every minute (rain and sport data are cached separately and cleared when changed).
export const revalidate = 60;

export default function Home() {
  return (
    <Frame>
      <h1 className="sr-only">{APP_NAME}</h1>
      <p className="mb-5 text-lg text-muted">מה חדש בניר אליהו</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enabledModules().map((m) => {
          const S = SUMMARIES[m.slug];
          return (
            <SummaryCard key={m.slug} m={m}>
              {S ? (
                <Suspense fallback={<span className="text-muted">טוען…</span>}>
                  <S />
                </Suspense>
              ) : undefined}
            </SummaryCard>
          );
        })}
      </div>
    </Frame>
  );
}
