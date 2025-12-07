// src/lib/roles.ts
// RBAC (Role-Based Access Control) helper fonksiyonları

import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export type RoleName = "customer" | "vendor" | "admin";

export interface UserRole {
  role_name: RoleName;
  granted_at: string;
}

/**
 * Kullanıcının belirli bir role sahip olup olmadığını kontrol eder
 */
export async function hasRole(
  supabase: SupabaseClient<Database>,
  userId: string,
  roleName: RoleName
): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    check_user_id: userId,
    check_role_name: roleName,
  });

  if (error) {
    console.error("hasRole error:", error);
    return false;
  }

  return data === true;
}

/**
 * Kullanıcının tüm rollerini getirir
 */
export async function getUserRoles(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserRole[]> {
  const { data, error } = await supabase.rpc("get_user_roles", {
    check_user_id: userId,
  });

  if (error) {
    console.error("getUserRoles error:", error);
    return [];
  }

  return (data as UserRole[]) || [];
}

/**
 * Kullanıcıya yeni bir rol ekler
 */
export async function addUserRole(
  supabase: SupabaseClient<Database>,
  userId: string,
  roleName: RoleName,
  granterId?: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("add_user_role", {
    target_user_id: userId,
    role_name: roleName,
    granter_id: granterId || null,
  });

  if (error) {
    console.error("addUserRole error:", error);
    return false;
  }

  return data === true;
}

/**
 * Kullanıcının vendor olup olmadığını kontrol eder
 * (vendors tablosunda kayıt var mı diye de bakılabilir)
 */
export async function isVendor(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  // Önce user_roles tablosuna bak
  const hasVendorRole = await hasRole(supabase, userId, "vendor");
  if (hasVendorRole) return true;

  // Fallback: vendors tablosuna bak (geçiş döneminde)
  const { data } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  return !!data;
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 */
export async function isAdmin(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  // Önce user_roles tablosuna bak
  const hasAdminRole = await hasRole(supabase, userId, "admin");
  if (hasAdminRole) return true;

  // Fallback: profiles.role'a bak (geçiş döneminde)
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

/**
 * Kullanıcının customer olup olmadığını kontrol eder
 */
export async function isCustomer(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<boolean> {
  return hasRole(supabase, userId, "customer");
}

/**
 * Kullanıcı profil bilgilerini rollerle birlikte getirir
 */
export async function getUserWithRoles(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("getUserWithRoles profile error:", profileError);
    return null;
  }

  const roles = await getUserRoles(supabase, userId);

  return {
    ...profile,
    roles,
    is_customer: roles.some((r) => r.role_name === "customer"),
    is_vendor: roles.some((r) => r.role_name === "vendor"),
    is_admin: roles.some((r) => r.role_name === "admin"),
  };
}
