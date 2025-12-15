"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface ImageCarouselProps {
  images: { id: string; image_url: string; is_primary?: boolean }[];
  alt: string;
  fallbackLetter?: string;
  aspectRatio?: "4/3" | "16/9" | "1/1";
  showArrows?: boolean;
  showDots?: boolean;
  onSlideChange?: (index: number) => void;
}

export default function ImageCarousel({
  images,
  alt,
  fallbackLetter,
  aspectRatio = "4/3",
  showArrows = true,
  showDots = true,
  onSlideChange,
}: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      emblaApi?.scrollPrev();
    },
    [emblaApi]
  );

  const scrollNext = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      emblaApi?.scrollNext();
    },
    [emblaApi]
  );

  const onDotClick = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setSelectedIndex(index);
      onSlideChange?.(index);
    };

    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("init", onInit);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);

    // Initial state - async to satisfy React 19 lint rules
    const initTimeout = setTimeout(() => {
      if (emblaApi.scrollSnapList().length > 0) {
        setScrollSnaps(emblaApi.scrollSnapList());
        setSelectedIndex(emblaApi.selectedScrollSnap());
      }
    }, 0);

    return () => {
      clearTimeout(initTimeout);
      emblaApi.off("select", onSelect);
      emblaApi.off("init", onInit);
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSlideChange]);

  const aspectClass = {
    "4/3": "aspect-[4/3]",
    "16/9": "aspect-[16/9]",
    "1/1": "aspect-square",
  }[aspectRatio];

  const canScrollPrev = images.length > 1;
  const canScrollNext = images.length > 1;

  // Fotoğraf yoksa fallback göster
  if (!images || images.length === 0) {
    return (
      <div
        className={`relative ${aspectClass} overflow-hidden rounded-xl bg-slate-100`}
      >
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <span className="text-4xl font-bold text-slate-300">
            {fallbackLetter?.toUpperCase() || "?"}
          </span>
        </div>
      </div>
    );
  }

  // Tek fotoğraf varsa carousel kullanma
  if (images.length === 1) {
    return (
      <div
        className={`relative ${aspectClass} overflow-hidden rounded-xl bg-slate-100`}
      >
        <Image
          src={images[0].image_url}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="group/carousel relative">
      {/* Carousel Container */}
      <div
        ref={emblaRef}
        className={`overflow-hidden rounded-xl ${aspectClass}`}
      >
        <div className="flex h-full">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              <Image
                src={image.image_url}
                alt={`${alt} - ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md transition-opacity hover:bg-white disabled:opacity-0 group-hover/carousel:opacity-100"
            aria-label="Önceki fotoğraf"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md transition-opacity hover:bg-white disabled:opacity-0 group-hover/carousel:opacity-100"
            aria-label="Sonraki fotoğraf"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && scrollSnaps.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={(e) => onDotClick(e, index)}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                index === selectedIndex
                  ? "bg-white w-3"
                  : "bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Fotoğraf ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
