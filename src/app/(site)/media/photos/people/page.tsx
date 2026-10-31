import { Frame } from "@/core/ui/Frame";
import { BackLink } from "@/modules/media/BackLink";
import { getPeople, type PersonSummary } from "@/modules/media/immich";
import { PeopleGrid } from "./PeopleGrid";
import { notFound } from "next/navigation";
import { showPeople } from "@/modules/media/settings";

export const metadata = { title: "אנשים – מדיה" };

export default async function PeoplePage() {
  if (!(await showPeople())) notFound(); // turned off on the admin page
  let people: PersonSummary[] | null;
  try {
    people = await getPeople();
  } catch {
    people = null;
  }

  return (
    <Frame active="media">
      <BackLink href="/media/photos" label="לתמונות" />
      <div className="flex flex-wrap items-baseline gap-x-4">
        <h1 className="font-display text-[2.6rem] leading-[1.05] sm:text-6xl">אנשים</h1>
        {people && people.length > 0 && <span className="text-lg text-muted">{people.length.toLocaleString("he-IL")}</span>}
      </div>

      {people === null ? (
        <p className="mt-8 rounded-[2rem] border-2 border-dashed border-sun-deep/50 p-10 text-center text-lg text-muted">
          שרת התמונות לא זמין כרגע. נסו שוב בעוד כמה דקות.
        </p>
      ) : people.length === 0 ? (
        <p className="mt-8 rounded-[2rem] border-2 border-dashed border-sun-deep/50 p-10 text-center text-lg text-muted">
          עוד לא סומנו כאן אנשים.
        </p>
      ) : (
        <PeopleGrid people={people} />
      )}
    </Frame>
  );
}
