import { redirect } from "next/navigation";
import { getViewer } from "@/core/auth";
import { Frame } from "@/core/ui/Frame";
import { GoogleButton } from "./GoogleButton";

export const metadata = { title: "כניסה" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next: nextParam, error } = await searchParams;
  const next = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  const viewer = await getViewer();
  if (viewer.user) redirect(viewer.isApproved ? next : "/pending");

  return (
    <Frame>
      <section className="mx-auto max-w-md rounded-3xl border border-line bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">כניסה לחברי הקיבוץ</h1>
        <p className="mt-2 text-muted">
          רוב האפליקציה פתוחה לכולם. כניסה נדרשת רק לפעולות כמו הזמנת מגרש. בפעם הראשונה הבקשה עוברת לאישור מנהל.
        </p>
        {error === "link" && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-800">
            הכניסה לא הושלמה. נסו שוב.
          </p>
        )}
        <div className="mt-6">
          <GoogleButton next={next} />
        </div>
      </section>
    </Frame>
  );
}
