import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

// Tip tanımları
type UserRole = Database["public"]["Enums"]["user_role"];

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
};

const validRoles: UserRole[] = ["admin", "vendor_owner", "customer"];

function isValidRole(role: string): role is UserRole {
  return validRoles.includes(role as UserRole);
}

async function updateUserRole(formData: FormData) {
  "use server";

  const userId = formData.get("user_id") as string;
  const role = formData.get("role") as string;

  if (!userId || !role || !isValidRole(role)) return;

  await supabaseAdmin
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  revalidatePath("/panel/users");
}

export default async function AdminUsersPage() {
  const { data: users, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, role, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const typedUsers = users as UserProfile[] | null;

  const roleOptions = [
    {
      value: "customer" as const,
      label: "Müşteri",
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "vendor_owner" as const,
      label: "Tedarikçi",
      color: "bg-leaf-100 text-leaf-700",
    },
    {
      value: "admin" as const,
      label: "Admin",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  // Rol bazlı istatistikler
  const roleCounts = typedUsers?.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<UserRole, number>);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Kullanıcı Yönetimi</h1>
        <p className="text-sm text-slate-600">
          {typedUsers?.length || 0} kullanıcı listelendi
        </p>
      </div>

      {/* Rol İstatistikleri */}
      <div className="flex flex-wrap gap-3">
        {roleOptions.map((role) => (
          <div
            key={role.value}
            className="rounded-lg border bg-white px-4 py-2 text-sm"
          >
            <span className={`rounded-full px-2 py-0.5 text-xs ${role.color}`}>
              {role.label}
            </span>
            <span className="ml-2 font-semibold">
              {roleCounts?.[role.value] || 0}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Hata: {error.message}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Kullanıcı
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Telefon
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Rol
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                Kayıt
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {typedUsers?.map((user) => {
              const currentRole = roleOptions.find(
                (r) => r.value === user.role
              );
              return (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{user.full_name || "-"}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{user.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        currentRole?.color || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {currentRole?.label || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(user.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <form
                      action={updateUserRole}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="user_id" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        className="rounded border px-2 py-1 text-xs"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded bg-slate-600 px-2 py-1 text-xs text-white hover:bg-slate-700"
                      >
                        Kaydet
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!typedUsers || typedUsers.length === 0) && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            Henüz kullanıcı yok
          </div>
        )}
      </div>
    </div>
  );
}
