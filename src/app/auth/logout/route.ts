import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Session'ı sonlandır
  await supabase.auth.signOut();

  // Doğrudan cateringle.com'a yönlendir
  return NextResponse.redirect("https://cateringle.com/", {
    status: 302,
  });
}
