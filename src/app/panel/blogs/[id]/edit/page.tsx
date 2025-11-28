// src/app/panel/blogs/[id]/edit/page.tsx
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: blog } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!blog) {
    notFound();
  }

  async function updateBlog(formData: FormData) {
    "use server";

    const supabase = await createServerSupabaseClient();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const cover_image_url = formData.get("cover_image_url") as string;
    const status = formData.get("status") as string;
    const blogId = formData.get("blog_id") as string;

    const { data: existingBlog } = await supabase
      .from("blog_posts")
      .select("status, published_at")
      .eq("id", blogId)
      .single();

    const updateData: Record<string, unknown> = {
      title,
      content,
      excerpt: excerpt || null,
      cover_image_url: cover_image_url || null,
      status,
    };

    // İlk kez yayınlanıyorsa published_at'i set et
    if (status === "published" && existingBlog?.status !== "published") {
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("blog_posts")
      .update(updateData)
      .eq("id", blogId);

    if (error) {
      redirect(
        `/panel/blogs/${blogId}/edit?error=` + encodeURIComponent(error.message)
      );
    }

    redirect("/panel/blogs");
  }

  async function deleteBlog(formData: FormData) {
    "use server";

    const supabase = await createServerSupabaseClient();
    const blogId = formData.get("blog_id") as string;

    await supabase.from("blog_posts").delete().eq("id", blogId);

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
          Blog Yazısını Düzenle
        </h1>
      </div>

      <form action={updateBlog} className="space-y-6">
        <input type="hidden" name="blog_id" value={blog.id} />

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
                defaultValue={blog.title}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Slug
              </label>
              <input
                type="text"
                disabled
                value={blog.slug}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
              />
              <p className="mt-1 text-xs text-slate-500">Slug değiştirilemez</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Özet
              </label>
              <textarea
                name="excerpt"
                rows={2}
                defaultValue={blog.excerpt || ""}
                placeholder="Kısa açıklama"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Kapak Görseli URL
              </label>
              <input
                name="cover_image_url"
                type="url"
                defaultValue={blog.cover_image_url || ""}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                defaultValue={blog.content}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Durum
              </label>
              <select
                name="status"
                defaultValue={blog.status}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayında</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <form action={deleteBlog}>
            <input type="hidden" name="blog_id" value={blog.id} />
            <button
              type="submit"
              onClick={(e) => {
                if (
                  !confirm(
                    "Bu blog yazısını silmek istediğinizden emin misiniz?"
                  )
                ) {
                  e.preventDefault();
                }
              }}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              Sil
            </button>
          </form>

          <div className="flex items-center gap-3">
            <Link
              href="/panel/blogs"
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              İptal
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Güncelle
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
