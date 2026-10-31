"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/core/supabase/client";

// "ניהול" for media admins. Checked in the browser so the media pages stay cacheable;
// /media/admin itself checks again on the server (requireAdmin("media")).
export function AdminLink() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return;
      const [{ data: p }, { data: roles }] = await Promise.all([
        supabase.from("kne_profiles").select("status").eq("id", user.id).maybeSingle(),
        supabase.from("kne_roles").select("section").eq("user_id", user.id),
      ]);
      setShow(p?.status === "approved" && (roles ?? []).some((r) => r.section === "*" || r.section === "media"));
    })();
  }, []);

  if (!show) return null;
  return (
    <Link href="/media/admin" className="rounded-full border-2 border-line px-3 py-1.5 text-sm font-medium hover:bg-line/50">
      ניהול
    </Link>
  );
}
