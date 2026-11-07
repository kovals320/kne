import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/core/supabase/proxy";
import { MODULES } from "@/core/modules";

// Sections switched off in modules.ts (enabled: false) are closed: their pages go to the home page,
// their APIs answer 404.
const OFF = MODULES.filter((m) => !m.enabled).map((m) => m.slug);
// With only one section open, the home page opens that section directly.
const ON = MODULES.filter((m) => m.enabled);
const START = ON.length === 1 && ON[0].href.startsWith("/") ? ON[0].href : null;

export async function proxy(request: NextRequest) {
  if (START && request.nextUrl.pathname === "/") return NextResponse.redirect(new URL(START, request.url));
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  const isApi = parts[0] === "api";
  const slug = isApi ? parts[1] : parts[0];
  if (slug && OFF.includes(slug)) {
    if (isApi) return new NextResponse(null, { status: 404 });
    return NextResponse.redirect(new URL("/", request.url));
  }
  // Media images don't need the signed-in session (and there are many of them): skip the refresh.
  if (isApi && slug === "media" && (parts[2] === "photo" || parts[2] === "person")) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
