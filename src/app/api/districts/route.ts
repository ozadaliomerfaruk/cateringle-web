import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cityId = searchParams.get("cityId");

  if (!cityId) {
    return NextResponse.json({ districts: [] });
  }

  const supabase = await createServerSupabaseClient();

  const { data: districts, error } = await supabase
    .from("districts")
    .select("id, name, slug")
    .eq("city_id", parseInt(cityId))
    .order("name");

  if (error) {
    console.error("Districts fetch error:", error);
    return NextResponse.json({ districts: [] });
  }

  return NextResponse.json({ districts: districts || [] });
}
