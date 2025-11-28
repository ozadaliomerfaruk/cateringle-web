// src/app/components/ImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  vendorId: string;
  currentImageUrl?: string | null;
  type: "logo" | "gallery";
  onUploadComplete: (url: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  vendorId,
  currentImageUrl,
  type,
  onUploadComplete,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    type === "logo" ? currentImageUrl || null : null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDisabled = disabled || uploading;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya kontrolü
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Sadece JPEG, PNG veya WebP dosyaları yükleyebilirsiniz.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const supabase = createBrowserSupabaseClient();

      // Dosya adı oluştur
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName =
        type === "logo"
          ? `${vendorId}/logo.${fileExt}`
          : `${vendorId}/gallery/${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 8)}.${fileExt}`;

      // Eski logoyu sil (logo için)
      if (type === "logo" && currentImageUrl) {
        const oldPath = currentImageUrl.split("/vendor-images/")[1];
        if (oldPath) {
          await supabase.storage.from("vendor-images").remove([oldPath]);
        }
      }

      // Yeni dosyayı yükle
      const { data, error: uploadError } = await supabase.storage
        .from("vendor-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: type === "logo", // Logo için üzerine yaz
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError("Yükleme başarısız oldu. Lütfen tekrar deneyin.");
        return;
      }

      // Public URL al
      const {
        data: { publicUrl },
      } = supabase.storage.from("vendor-images").getPublicUrl(data.path);

      // Logo için preview güncelle, gallery için güncelleme
      if (type === "logo") {
        setPreview(publicUrl);
      }

      onUploadComplete(publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Beklenmeyen bir hata oluştu.");
    } finally {
      setUploading(false);
      // Input'u temizle - aynı dosyanın tekrar seçilebilmesi için
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    // Sadece logo için silme işlemi
    if (type !== "logo" || !preview) return;

    setUploading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const path = preview.split("/vendor-images/")[1];

      if (path) {
        await supabase.storage.from("vendor-images").remove([path]);
      }

      setPreview(null);
      onUploadComplete("");
    } catch (err) {
      console.error("Remove error:", err);
      setError("Silme işlemi başarısız oldu.");
    } finally {
      setUploading(false);
    }
  };

  // Gallery modu için sadece upload butonu göster
  if (type === "gallery") {
    return (
      <div className="space-y-2">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <svg
                className="h-6 w-6 animate-spin text-emerald-600"
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
              <span className="mt-1 text-xs">Yükleniyor...</span>
            </div>
          ) : (
            <div className="text-center">
              <svg
                className="mx-auto h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="mt-1 text-xs">Fotoğraf Ekle</p>
            </div>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={isDisabled}
          className="hidden"
        />
      </div>
    );
  }

  // Logo modu
  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {preview ? (
        <div className="relative inline-block">
          <Image
            src={preview}
            alt="Yüklenen logo"
            width={96}
            height={96}
            className="h-24 w-24 rounded-lg border object-cover"
            style={{ objectFit: "cover" }}
            unoptimized
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={isDisabled}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <svg
                className="h-4 w-4 animate-spin"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <svg
                className="h-5 w-5 animate-spin text-emerald-600"
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
            <div className="text-center">
              <span className="text-2xl">📷</span>
              <p className="mt-1 text-xs">Logo Yükle</p>
            </div>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={isDisabled}
        className="hidden"
      />
    </div>
  );
}
