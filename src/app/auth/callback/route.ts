import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // Get user profile to determine redirect
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, onboarding_completed")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        if (!profile.onboarding_completed) {
          return NextResponse.redirect(`${origin}/${profile.user_type}/onboarding`);
        }
        return NextResponse.redirect(`${origin}/${profile.user_type}/dashboard`);
      }
    }
  }

  // Default redirect to home
  return NextResponse.redirect(`${origin}/`);
}
