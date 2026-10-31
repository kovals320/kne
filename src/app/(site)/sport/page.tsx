import { getViewer } from "@/core/auth";
import { Frame } from "@/core/ui/Frame";
import { Icon } from "@/core/ui/Icon";
import { SportApp } from "./SportApp";

export const metadata = { title: "מגרשי ספורט" };

export default async function SportPage() {
  const viewer = await getViewer();
  return (
    <Frame active="sport">
      <div className="mb-4">
        <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
          <span style={{ color: "#a34a0a" }}>
            <Icon name="sport" className="h-8 w-8" />
          </span>
          מגרשי ספורט
        </h1>
        <p className="mt-1 text-muted">בחרו יום כדי לראות מי הזמין. כדי להזמין מגרש או להצטרף למשחק צריך להיכנס.</p>
      </div>
      <SportApp
        viewer={{
          userId: viewer.user?.id ?? null,
          approved: viewer.isApproved,
          pending: viewer.profile?.status === "pending" || (!!viewer.user && !viewer.profile),
          isAdmin: viewer.isAdmin("sport"),
        }}
      />
    </Frame>
  );
}
