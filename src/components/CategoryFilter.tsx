"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

interface CategoryFilterProps {
  categories: Category[];
  currentCategory?: string;
  currentParams: Record<string, string | undefined>;
}

export default function CategoryFilter({
  categories,
  currentCategory,
  currentParams,
}: CategoryFilterProps) {
  const router = useRouter();

  // URL oluşturma fonksiyonu - artık component içinde
  function buildFilterUrl(newParams: { category?: string }) {
    const merged = { ...currentParams, ...newParams };
    const searchParamsObj = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (value) searchParamsObj.set(key, value);
    });
    const queryString = searchParamsObj.toString();
    return `/vendors${queryString ? `?${queryString}` : ""}`;
  }

  // Mobil dropdown değişikliği
  const handleMobileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    router.push(buildFilterUrl({ category: value || undefined }));
  };

  return (
    <>
      {/* Mobil - Dropdown */}
      <div className="relative md:hidden">
        <select
          value={currentCategory || ""}
          onChange={handleMobileChange}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 shadow-sm focus:border-leaf--500 focus:outline-none focus:ring-2 focus:ring-leaf--500/20"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        {/* Dropdown Arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-5 w-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Masaüstü - Flex Wrap Pills */}
      <div className="hidden md:block">
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildFilterUrl({ category: undefined })}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              !currentCategory
                ? "bg-leaf-600 text-white shadow-md"
                : "border border-slate-200 bg-white text-slate-700 hover:border-leaf--300 hover:bg-leaf-50"
            }`}
          >
            Tümü
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildFilterUrl({ category: cat.slug })}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                currentCategory === cat.slug
                  ? "bg-leaf-600 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-leaf--300 hover:bg-leaf-50"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
