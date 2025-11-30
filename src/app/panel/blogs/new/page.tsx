// src/app/panel/blogs/new/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NewBlogPage() {
  async function createBlog(formData: FormData) {
    "use server";

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth/login");
    }

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const cover_image_url = formData.get("cover_image_url") as string;
    const status = formData.get("status") as string;

    // Slug oluştur
    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9ğüşıöç\s-]/g, "")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now();

    const { error } = await supabase.from("blog_posts").insert({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      cover_image_url: cover_image_url || null,
      author_id: user.id,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    });

    if (error) {
      redirect("/panel/blogs/new?error=" + encodeURIComponent(error.message));
    }

    redirect("/panel/blogs");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <Link
          href="/panel/blogs"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Blog Yazılarına Dön
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Yeni Blog Yazısı
        </h1>
      </div>

      <form action={createBlog} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Başlık *
              </label>
              <input
                name="title"
                type="text"
                required
                placeholder="Blog yazısı başlığı"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-leaf--500 focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Özet
              </label>
              <textarea
                name="excerpt"
                rows={2}
                placeholder="Kısa açıklama (liste görünümünde gösterilir)"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-leaf--500 focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Kapak Görseli URL
              </label>
              <input
                name="cover_image_url"
                type="url"
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-leaf--500 focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                İçerik *
              </label>
              <textarea
                name="content"
                rows={15}
                required
                placeholder="Blog içeriğini buraya yazın... (Markdown desteklenir)"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm transition-all focus:border-leaf--500 focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
              />
              <p className="mt-2 text-xs text-slate-500">
                Markdown formatını kullanabilirsiniz: **kalın**, *italik*, #
                başlık, - liste
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Durum
              </label>
              <select
                name="status"
                defaultValue="draft"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-leaf--500 focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayınla</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/panel/blogs"
            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            İptal
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-leaf-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-leaf-700"
          >
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
