// src/app/components/GalleryUpload.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import ImageUpload from "./ImageUpload";

interface GalleryImage {
  id: string;
  image_url: string;
  sort_order: number;
}

interface GalleryUploadProps {
  vendorId: string;
  images: GalleryImage[];
}

export default function GalleryUpload({
  vendorId,
  images,
}: GalleryUploadProps) {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(images);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddImage = async (url: string) => {
    if (!url || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();

      const { data, error: insertError } = await supabase
        .from("vendor_images")
        .insert({
          vendor_id: vendorId,
          image_url: url,
          sort_order: galleryImages.length,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Gallery insert error:", insertError);
        setError("Fotoğraf kaydedilemedi. Lütfen tekrar deneyin.");

        // Storage'dan yüklenen dosyayı temizle
        const path = url.split("/vendor-images/")[1];
        if (path) {
          await supabase.storage.from("vendor-images").remove([path]);
        }
        return;
      }

      setGalleryImages((prev) => [...prev, data]);
    } catch (err) {
      console.error("Gallery upload error:", err);
      setError("Beklenmeyen bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveImage = async (imageId: string, imageUrl: string) => {
    if (deletingId || isProcessing) return;

    setDeletingId(imageId);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();

      // Veritabanından sil
      const { error: deleteError } = await supabase
        .from("vendor_images")
        .delete()
        .eq("id", imageId);

      if (deleteError) {
        console.error("Delete from DB error:", deleteError);
        setError("Fotoğraf silinemedi. Lütfen tekrar deneyin.");
        return;
      }

      // Storage'dan sil
      const path = imageUrl.split("/vendor-images/")[1];
      if (path) {
        const { error: storageError } = await supabase.storage
          .from("vendor-images")
          .remove([path]);

        if (storageError) {
          console.warn("Storage delete warning:", storageError);
          // Storage hatası kritik değil, devam et
        }
      }

      setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error("Remove image error:", err);
      setError("Beklenmeyen bir hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  };

  const isDisabled = isProcessing || !!deletingId;

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {galleryImages.map((image) => (
          <div key={image.id} className="relative aspect-square">
            <Image
              src={image.image_url}
              alt="Galeri görseli"
              fill
              sizes="(max-width: 640px) 33vw, 25vw"
              className={`rounded-lg border object-cover transition-opacity ${
                deletingId === image.id ? "opacity-50" : ""
              }`}
            />
            {deletingId === image.id ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20">
                <svg
                  className="h-6 w-6 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id, image.image_url)}
                disabled={isDisabled}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-md transition-all hover:bg-red-600 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}

        {/* Yeni görsel ekle butonu */}
        {galleryImages.length < 12 && (
          <ImageUpload
            vendorId={vendorId}
            type="gallery"
            onUploadComplete={handleAddImage}
            disabled={isDisabled}
          />
        )}
      </div>

      <p className="text-xs text-slate-500">
        Maksimum 12 fotoğraf yükleyebilirsiniz. ({galleryImages.length}/12)
      </p>
    </div>
  );
}
