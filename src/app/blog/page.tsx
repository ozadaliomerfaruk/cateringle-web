// src/app/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog | Cateringle.com",
  description:
    "Catering, etkinlik organizasyonu ve yemek kültürü hakkında bilgilendirici yazılar.",
};

export default async function BlogPage() {
  const supabase = await createServerSupabaseClient();

  const { data: blogs } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Blog
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Etkinlik planlama, catering ipuçları ve sektör haberleri
          </p>
        </div>

        {/* Blog Grid */}
        <div className="mt-12">
          {blogs && blogs.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Cover Image */}
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-50">
                    {blog.cover_image_url ? (
                      <Image
                        src={blog.cover_image_url}
                        alt={blog.title}
                        width={400}
                        height={225}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <svg
                          className="h-12 w-12 text-emerald-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-sm text-slate-500">
                      {blog.published_at
                        ? new Date(blog.published_at).toLocaleDateString(
                            "tr-TR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : ""}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900 group-hover:text-emerald-600">
                      {blog.title}
                    </h2>
                    {blog.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {blog.excerpt}
                      </p>
                    )}
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                      Devamını Oku
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Blog yazıları hazırlanıyor
              </h3>
              <p className="mt-2 text-slate-500">
                Yakında catering dünyasından faydalı içerikler paylaşacağız.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
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
                Ana Sayfaya Dön
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
