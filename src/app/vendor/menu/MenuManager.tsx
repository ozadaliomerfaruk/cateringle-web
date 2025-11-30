"use client";

import { useState } from "react";

// Tip tanımları
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price_per_person: number | null;
  min_order_count: number | null;
};

type MenuCategory = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number | null;
  menu_items: MenuItem[];
};

type Package = {
  id: string;
  name: string;
  description: string | null;
  price_per_person: number;
  min_guest_count: number | null;
  max_guest_count: number | null;
  includes: string[] | null;
};

interface MenuManagerProps {
  categories: MenuCategory[];
  packages: Package[];
  actions: {
    addCategory: (formData: FormData) => Promise<void>;
    deleteCategory: (formData: FormData) => Promise<void>;
    addMenuItem: (formData: FormData) => Promise<void>;
    deleteMenuItem: (formData: FormData) => Promise<void>;
    addPackage: (formData: FormData) => Promise<void>;
    deletePackage: (formData: FormData) => Promise<void>;
  };
}

export default function MenuManager({
  categories,
  packages,
  actions,
}: MenuManagerProps) {
  const [activeTab, setActiveTab] = useState<"menu" | "packages">("menu");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState<string | null>(null);
  const [showPackageForm, setShowPackageForm] = useState(false);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-xl font-semibold">Menü ve Paketler</h1>
      <p className="mb-6 text-sm text-slate-600">
        Menülerinizi ve paketlerinizi yönetin. Bu bilgiler firma sayfanızda
        görüntülenir.
      </p>

      {/* Tab Menü */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("menu")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "menu"
              ? "border-b-2 border-leaf--600 text-leaf-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Menüler
        </button>
        <button
          onClick={() => setActiveTab("packages")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "packages"
              ? "border-b-2 border-leaf--600 text-leaf-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Paketler
        </button>
      </div>

      {/* Menüler */}
      {activeTab === "menu" && (
        <div className="space-y-6">
          {/* Kategori Ekle Butonu */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              className="rounded-md bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
            >
              + Kategori Ekle
            </button>
          </div>

          {/* Kategori Ekleme Formu */}
          {showCategoryForm && (
            <form
              action={async (formData) => {
                await actions.addCategory(formData);
                setShowCategoryForm(false);
              }}
              className="rounded-lg border bg-white p-4"
            >
              <h3 className="mb-3 text-sm font-semibold">Yeni Kategori</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Kategori adı (örn: Düğün Menüsü)"
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Açıklama (opsiyonel)"
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-md bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="rounded-md border px-4 py-2 text-sm hover:bg-slate-50"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Kategoriler ve Öğeler */}
          {categories.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center">
              <p className="text-slate-500">
                Henüz menü kategorisi eklenmemiş.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Yukarıdaki butona tıklayarak ilk kategorinizi ekleyin.
              </p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="rounded-lg border bg-white">
                {/* Kategori Başlığı */}
                <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="text-xs text-slate-500">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setShowItemForm(
                          showItemForm === category.id ? null : category.id
                        )
                      }
                      className="rounded bg-leaf-100 px-2 py-1 text-xs font-medium text-leaf-700 hover:bg-leaf-200"
                    >
                      + Öğe Ekle
                    </button>
                    <form action={actions.deleteCategory}>
                      <input
                        type="hidden"
                        name="category_id"
                        value={category.id}
                      />
                      <button
                        type="submit"
                        className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                      >
                        Sil
                      </button>
                    </form>
                  </div>
                </div>

                {/* Öğe Ekleme Formu */}
                {showItemForm === category.id && (
                  <form
                    action={async (formData) => {
                      await actions.addMenuItem(formData);
                      setShowItemForm(null);
                    }}
                    className="border-b bg-leaf-50 p-4"
                  >
                    <input
                      type="hidden"
                      name="category_id"
                      value={category.id}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Öğe adı *"
                        className="rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                      />
                      <input
                        type="number"
                        name="price"
                        step="0.01"
                        placeholder="Kişi başı fiyat (TL)"
                        className="rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                      />
                      <input
                        type="text"
                        name="description"
                        placeholder="Açıklama"
                        className="rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                      />
                      <input
                        type="number"
                        name="min_order"
                        placeholder="Min. sipariş adedi"
                        className="rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="submit"
                        className="rounded-md bg-leaf-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-leaf-700"
                      >
                        Ekle
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowItemForm(null)}
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-white"
                      >
                        İptal
                      </button>
                    </div>
                  </form>
                )}

                {/* Menü Öğeleri */}
                <div className="divide-y">
                  {category.menu_items?.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-400">
                      Bu kategoride henüz öğe yok.
                    </p>
                  ) : (
                    category.menu_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-slate-500">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {item.price_per_person && (
                            <span className="rounded bg-leaf-100 px-2 py-0.5 text-xs font-medium text-leaf-700">
                              {item.price_per_person} TL/kişi
                            </span>
                          )}
                          <form action={actions.deleteMenuItem}>
                            <input
                              type="hidden"
                              name="item_id"
                              value={item.id}
                            />
                            <button
                              type="submit"
                              className="text-xs text-red-600 hover:underline"
                            >
                              Sil
                            </button>
                          </form>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Paketler */}
      {activeTab === "packages" && (
        <div className="space-y-6">
          {/* Paket Ekle Butonu */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowPackageForm(!showPackageForm)}
              className="rounded-md bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
            >
              + Paket Ekle
            </button>
          </div>

          {/* Paket Ekleme Formu */}
          {showPackageForm && (
            <form
              action={async (formData) => {
                await actions.addPackage(formData);
                setShowPackageForm(false);
              }}
              className="rounded-lg border bg-white p-4"
            >
              <h3 className="mb-3 text-sm font-semibold">Yeni Paket</h3>
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Paket adı (örn: Altın Paket) *"
                    className="rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                  />
                  <input
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    placeholder="Kişi başı fiyat (TL) *"
                    className="rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                  />
                  <input
                    type="number"
                    name="min_guests"
                    placeholder="Min. kişi sayısı"
                    className="rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                  />
                  <input
                    type="number"
                    name="max_guests"
                    placeholder="Max. kişi sayısı"
                    className="rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                  />
                </div>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Paket açıklaması"
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                />
                <textarea
                  name="includes"
                  rows={4}
                  placeholder="Dahil olan hizmetler (her satıra bir tane)&#10;Örn:&#10;3 çeşit meze&#10;Ana yemek&#10;Tatlı&#10;İçecek"
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-leaf--500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-md bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPackageForm(false)}
                    className="rounded-md border px-4 py-2 text-sm hover:bg-slate-50"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Paket Listesi */}
          {packages.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center">
              <p className="text-slate-500">Henüz paket eklenmemiş.</p>
              <p className="mt-1 text-sm text-slate-400">
                Yukarıdaki butona tıklayarak ilk paketinizi ekleyin.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {packages.map((pkg) => (
                <div key={pkg.id} className="rounded-lg border bg-white p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{pkg.name}</h3>
                      <p className="text-lg font-bold text-leaf-600">
                        {pkg.price_per_person} TL
                        <span className="text-sm font-normal text-slate-500">
                          /kişi
                        </span>
                      </p>
                    </div>
                    <form action={actions.deletePackage}>
                      <input type="hidden" name="package_id" value={pkg.id} />
                      <button
                        type="submit"
                        className="text-xs text-red-600 hover:underline"
                      >
                        Sil
                      </button>
                    </form>
                  </div>

                  {pkg.description && (
                    <p className="mb-3 text-sm text-slate-600">
                      {pkg.description}
                    </p>
                  )}

                  {(pkg.min_guest_count || pkg.max_guest_count) && (
                    <p className="mb-2 text-xs text-slate-500">
                      Kapasite: {pkg.min_guest_count || "?"} -{" "}
                      {pkg.max_guest_count || "?"} kişi
                    </p>
                  )}

                  {pkg.includes && pkg.includes.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Dahil olanlar:
                      </p>
                      <ul className="space-y-1">
                        {pkg.includes.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <svg
                              className="h-4 w-4 text-leaf-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
