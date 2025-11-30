"use client";

interface Segment {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  segment_id: number | null;
  is_active: boolean;
}

export default function CategoryRow({
  category,
  segments,
  updateAction,
  toggleAction,
}: {
  category: Category;
  segments: Segment[];
  updateAction: (formData: FormData) => Promise<void>;
  toggleAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{category.icon || "📁"}</span>
          <span className="font-medium text-slate-900">{category.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
          {category.slug}
        </code>
      </td>
      <td className="px-4 py-3">
        <form action={updateAction}>
          <input type="hidden" name="category_id" value={category.id} />
          <select
            name="segment_id"
            defaultValue={category.segment_id?.toString() || ""}
            onChange={(e) => e.target.form?.requestSubmit()}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm focus:border-leaf--500 focus:outline-none focus:ring-1 focus:ring-leaf--500"
          >
            <option value="">Segment Seç</option>
            {segments.map((seg) => (
              <option key={seg.id} value={seg.id}>
                {seg.slug === "kurumsal" ? "🏢" : "🎉"} {seg.name}
              </option>
            ))}
          </select>
        </form>
      </td>
      <td className="px-4 py-3">
        <form action={toggleAction}>
          <input type="hidden" name="category_id" value={category.id} />
          <input
            type="hidden"
            name="is_active"
            value={category.is_active.toString()}
          />
          <button
            type="submit"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category.is_active
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {category.is_active ? "Aktif" : "Pasif"}
          </button>
        </form>
      </td>
    </tr>
  );
}
