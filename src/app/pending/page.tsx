import { redirect } from "next/navigation";
import { displayName, getViewer } from "@/core/auth";
import { Frame } from "@/core/ui/Frame";
import { signOut } from "@/app/actions";

export const metadata = { title: "ממתין לאישור" };

export default async function PendingPage() {
  const viewer = await getViewer();
  if (!viewer.user) redirect("/login");
  if (viewer.isApproved) redirect("/");
  const blocked = viewer.profile?.status === "blocked";

  return (
    <Frame>
      <section className="mx-auto max-w-md rounded-3xl border border-line bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">{blocked ? "אין גישה" : "הבקשה התקבלה"}</h1>
        <p className="mt-2 text-lg">
          {viewer.profile ? `שלום ${displayName(viewer.profile)}. ` : ""}
          {blocked
            ? "החשבון הזה לא אושר לשימוש באפליקציה. אם זו טעות, פנו למנהלי האפליקציה."
            : "הבקשה שלכם להצטרף ממתינה לאישור מנהל. אחרי האישור, היכנסו שוב והכול יהיה פתוח."}
        </p>
        <p className="mt-3 text-muted">בינתיים אפשר להמשיך לגלוש בחלקים הפתוחים של האפליקציה.</p>
        <div className="mt-6 flex gap-3">
          <a href="/" className="rounded-2xl bg-brand px-5 py-3 font-semibold text-white">
            לעמוד הראשי
          </a>
          <form action={signOut}>
            <button className="rounded-2xl border-2 border-line px-5 py-3 font-semibold">יציאה</button>
          </form>
        </div>
      </section>
    </Frame>
  );
}
