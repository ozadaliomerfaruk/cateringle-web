"use client";

import { useState } from "react";
import Image from "next/image";
import PhotoGalleryModal from "./PhotoGalleryModal";
import { Images } from "@phosphor-icons/react";

interface VendorGalleryProps {
  images: { id: string; image_url: string }[];
  vendorName: string;
  logoUrl?: string | null;
}

export default function VendorGallery({
  images,
  vendorName,
  logoUrl,
}: VendorGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Gösterilecek görseller (images yoksa logo kullan)
  const galleryImages =
    images.length > 0
      ? images
      : logoUrl
      ? [{ id: "logo", image_url: logoUrl }]
      : [];

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  // Fotoğraf yoksa placeholder göster
  if (galleryImages.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 sm:aspect-[21/9]">
        <div className="text-center">
          <span className="text-6xl font-bold text-slate-300">
            {vendorName.charAt(0).toUpperCase()}
          </span>
          <p className="mt-2 text-sm text-slate-400">
            Henüz fotoğraf eklenmemiş
          </p>
        </div>
      </div>
    );
  }

  // Tek fotoğraf varsa basit göster
  if (galleryImages.length === 1) {
    return (
      <>
        <button
          onClick={() => openModal(0)}
          className="relative block w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:ring-offset-2"
        >
          <div className="relative aspect-[16/9] sm:aspect-[21/9]">
            <Image
              src={galleryImages[0].image_url}
              alt={vendorName}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>
        </button>

        <PhotoGalleryModal
          images={galleryImages}
          initialIndex={0}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          alt={vendorName}
        />
      </>
    );
  }

  // Çoklu fotoğraf - Airbnb grid
  return (
    <>
      <div className="relative grid grid-cols-4 gap-2 overflow-hidden rounded-xl">
        {/* Ana Görsel - Sol taraf */}
        <button
          onClick={() => openModal(0)}
          className="relative col-span-4 aspect-[16/9] overflow-hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-leaf-500 sm:col-span-2 sm:row-span-2 sm:aspect-square"
        >
          <Image
            src={galleryImages[0].image_url}
            alt={vendorName}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            priority
          />
        </button>

        {/* Küçük Görseller - Sağ taraf */}
        {galleryImages.slice(1, 5).map((img, idx) => (
          <button
            key={img.id}
            onClick={() => openModal(idx + 1)}
            className="relative hidden aspect-square overflow-hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-leaf-500 sm:block"
          >
            <Image
              src={img.image_url}
              alt={`${vendorName} - ${idx + 2}`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
            {/* Son görselde "daha fazla" overlay */}
            {idx === 3 && galleryImages.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors hover:bg-black/50">
                <span className="text-sm font-medium text-white">
                  +{galleryImages.length - 5} fotoğraf
                </span>
              </div>
            )}
          </button>
        ))}

        {/* Mobilde "Tüm Fotoğraflar" butonu */}
        {galleryImages.length > 1 && (
          <button
            onClick={() => openModal(0)}
            className="absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-lg transition-colors hover:bg-slate-100 sm:hidden"
          >
            <Images size={18} weight="bold" />
            {galleryImages.length} fotoğraf
          </button>
        )}
      </div>

      {/* Desktop "Tüm Fotoğrafları Göster" butonu */}
      {galleryImages.length > 5 && (
        <div className="mt-3 hidden justify-end sm:flex">
          <button
            onClick={() => openModal(0)}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
          >
            <Images size={18} weight="bold" />
            Tüm fotoğrafları göster ({galleryImages.length})
          </button>
        </div>
      )}

      <PhotoGalleryModal
        images={galleryImages}
        initialIndex={selectedIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alt={vendorName}
      />
    </>
  );
}
