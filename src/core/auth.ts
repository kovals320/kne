import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/core/supabase/server";

export type Status = "pending" | "approved" | "blocked";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: Status;
};

export type Viewer = {
  supabase: SupabaseClient;
  user: User | null;
  profile: Profile | null;
  sections: string[]; // sections this person is admin of ("*" = the whole app)
  isApproved: boolean;
  isSuper: boolean;
  isAdmin: (section: string) => boolean;
};

// Who is looking at the page. Checked on the server where it matters (admin pages, actions);
// public pages don't need it. The database enforces the same rules again (RLS).
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, user: null, profile: null, sections: [], isApproved: false, isSuper: false, isAdmin: () => false };
  }

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("kne_profiles").select("id, email, full_name, avatar_url, status").eq("id", user.id).maybeSingle(),
    supabase.from("kne_roles").select("section").eq("user_id", user.id),
  ]);
  const approved = profile?.status === "approved";
  const sections = approved ? (roles ?? []).map((r) => r.section as string) : [];
  const isSuper = sections.includes("*");
  return {
    supabase,
    user,
    profile: (profile as Profile | null) ?? null,
    sections,
    isApproved: approved,
    isSuper,
    isAdmin: (section: string) => isSuper || sections.includes(section),
  };
});

// A signed-in, approved member (e.g. to book a court). Others go to sign in or to the waiting page.
export async function requireMember(next = "/") {
  const viewer = await getViewer();
  if (!viewer.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!viewer.isApproved) redirect("/pending");
  return viewer as Viewer & { user: User; profile: Profile };
}

export async function requireAdmin(section: string, next = "/") {
  const viewer = await requireMember(next);
  if (!viewer.isAdmin(section)) redirect("/");
  return viewer;
}

export const requireSuper = (next = "/") => requireAdmin("*", next);

// Display name: the Google name, else the part of the email before @.
export function displayName(p: Pick<Profile, "full_name" | "email">) {
  return p.full_name?.trim() || p.email.split("@")[0];
}
