import { MediaSummary } from "./media/Summary";
import { RainSummary } from "./rain/Summary";
import { SportSummary } from "./sport/Summary";

// Each section's home-page summary (optional). A new section adds its Summary here;
// without one, its card shows the description from src/core/modules.ts.
export const SUMMARIES: Record<string, () => React.ReactNode | Promise<React.ReactNode>> = {
  rain: RainSummary,
  sport: SportSummary,
  media: MediaSummary,
};
