// src/app/auth/callback/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") || "/";

  // OAuth hatası varsa
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(errorDescription || error)}`,
        requestUrl.origin
      )
    );
  }

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        return NextResponse.redirect(
          new URL(
            `/auth/login?error=${encodeURIComponent(exchangeError.message)}`,
            requestUrl.origin
          )
        );
      }

      if (data.user) {
        // Profil kontrolü - yoksa oluştur
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (!profile) {
          // Yeni kullanıcı - profil oluştur
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name:
                data.user.user_metadata?.full_name ||
                data.user.email?.split("@")[0],
              role: "customer",
            });

          if (insertError) {
            console.error("Profile insert error:", insertError);
          }

          return NextResponse.redirect(new URL("/account", requestUrl.origin));
        }

        // Rol bazlı yönlendirme
        if (profile.role === "vendor_owner") {
          return NextResponse.redirect(new URL("/vendor", requestUrl.origin));
        } else if (profile.role === "admin") {
          return NextResponse.redirect(new URL("/panel", requestUrl.origin));
        } else {
          return NextResponse.redirect(new URL(next, requestUrl.origin));
        }
      }
    } catch (err) {
      console.error("Callback error:", err);
      return NextResponse.redirect(
        new URL(
          "/auth/login?error=Beklenmeyen bir hata oluştu",
          requestUrl.origin
        )
      );
    }
  }

  // Code yoksa login'e yönlendir
  return NextResponse.redirect(
    new URL("/auth/login?error=auth_failed", requestUrl.origin)
  );
}
