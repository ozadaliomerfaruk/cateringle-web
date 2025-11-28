// middleware.ts
import type { NextRequest } from "next/server";
import { updateSession } from "./src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Burada istersen route bazlı koruma da ekleyebiliriz ama şimdilik sadece session yeniliyoruz
  return updateSession(request);
}

// Statik dosyalar, image optimizasyonu vb. hariç tüm route'larda çalışsın
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
