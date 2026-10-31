import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/core/supabase/server";

// Google sends the person back here after signing in. On their first visit to this app we create their
// profile as "pending"; an admin approves it. Approved people continue to where they were going.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (!code) return NextResponse.redirect(`${origin}/login?error=link`);
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=link`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login?error=link`);

  let { data: profile } = await supabase.from("kne_profiles").select("status").eq("id", user.id).maybeSingle();
  if (!profile) {
    const meta = user.user_metadata ?? {};
    await supabase.from("kne_profiles").insert({
      id: user.id,
      email: (user.email ?? "").toLowerCase(),
      full_name: (meta.full_name as string) || (meta.name as string) || null,
      avatar_url: (meta.avatar_url as string) || (meta.picture as string) || null,
    });
    profile = { status: "pending" };
  }

  return NextResponse.redirect(`${origin}${profile.status === "approved" ? next : "/pending"}`);
}
