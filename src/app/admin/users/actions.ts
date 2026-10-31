"use server";

import { revalidatePath } from "next/cache";
import { requireSuper } from "@/core/auth";
import { MODULES } from "@/core/modules";

const SECTIONS = new Set(["*", ...MODULES.map((m) => m.slug)]);

// Approve / block / un-block a person. Only app admins; the database checks again (RLS).
export async function setStatus(userId: string, status: "approved" | "blocked" | "pending") {
  const { supabase, user } = await requireSuper("/admin/users");
  if (userId === user.id) return; // never lock yourself out
  await supabase
    .from("kne_profiles")
    .update({ status, decided_at: new Date().toISOString(), decided_by: user.id })
    .eq("id", userId);
  revalidatePath("/admin/users");
}

// Turn admin rights for one section on or off.
export async function setRole(userId: string, section: string, on: boolean) {
  const { supabase, user } = await requireSuper("/admin/users");
  if (!SECTIONS.has(section)) return;
  if (userId === user.id && section === "*" && !on) return; // keep at least yourself as app admin
  if (on) await supabase.from("kne_roles").upsert({ user_id: userId, section, role: "admin" });
  else await supabase.from("kne_roles").delete().eq("user_id", userId).eq("section", section);
  revalidatePath("/admin/users");
}
