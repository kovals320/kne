import type { NextRequest } from "next/server";
import { updateSession } from "@/core/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|api/media/photo|api/media/person|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
