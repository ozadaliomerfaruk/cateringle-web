// src/app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: blog } = await supabase
    .from("blog_posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!blog) {
    return { title: "Blog Yazısı Bulunamadı" };
  }

  return {
    title: `${blog.title} | Cateringle Blog`,
    description: blog.excerpt || blog.title,
  };
}

// Markdown'ı basit HTML'e çevir
function parseMarkdown(content: string): string {
  return (
    content
      // Headers
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>'
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-2xl font-semibold mt-10 mb-4">$1</h2>'
      )
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-3xl font-bold mt-10 mb-6">$1</h1>'
      )
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-leaf-600 hover:underline" target="_blank" rel="noopener">$1</a>'
      )
      // Unordered lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mt-4">')
      .replace(/\n/g, "<br>")
  );
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: blog } = await supabase
    .from("blog_posts")
    .select("*, author:profiles(full_name)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!blog) {
    notFound();
  }

  const contentHtml = parseMarkdown(blog.content);

  // Diğer blog yazıları
  const { data: relatedBlogs } = await supabase
    .from("blog_posts")
    .select("id, title, slug, cover_image_url")
    .eq("status", "published")
    .neq("id", blog.id)
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-leaf--600 via-leaf--700 to-teal-800">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-leaf-200 hover:text-white"
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
            Tüm Yazılar
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {blog.title}
          </h1>
          <div className="mt-6 flex items-center justify-center gap-4 text-leaf-100">
            {blog.author?.full_name && (
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-medium text-white">
                  {blog.author.full_name.charAt(0).toUpperCase()}
                </span>
                {blog.author.full_name}
              </span>
            )}
            {blog.published_at && (
              <>
                <span>•</span>
                <span>
                  {new Date(blog.published_at).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {blog.cover_image_url && (
        <div className="mx-auto -mt-8 max-w-4xl px-4">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <Image
              src={blog.cover_image_url}
              alt={blog.title}
              width={900}
              height={500}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="mx-auto max-w-3xl px-4 py-12">
        <div
          className="prose prose-lg prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-leaf-600 prose-strong:text-slate-900"
          dangerouslySetInnerHTML={{
            __html: `<p class="mt-4">${contentHtml}</p>`,
          }}
        />
      </article>

      {/* Related Posts */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <section className="border-t bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-bold text-slate-900">Diğer Yazılar</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedBlogs.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-leaf--100 to-teal-50">
                    {post.cover_image_url ? (
                      <Image
                        src={post.cover_image_url}
                        alt={post.title}
                        width={400}
                        height={225}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <svg
                          className="h-10 w-10 text-leaf-300"
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
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 group-hover:text-leaf-600">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
