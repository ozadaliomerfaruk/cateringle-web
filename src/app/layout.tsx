// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileBottomNav from "../components/MobileBottomNav";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  // ... mevcut metadata
};

export const viewport: Viewport = {
  // ... mevcut viewport
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side'da kullanıcı bilgisini al
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialUser = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    initialUser = {
      email: user.email || "",
      role: profile?.role || "customer",
    };
  }

  return (
    <html lang="tr" className={montserrat.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-background pb-20 font-sans text-foreground lg:pb-0">
        <div className="flex min-h-screen flex-col">
          <Header initialUser={initialUser} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}
