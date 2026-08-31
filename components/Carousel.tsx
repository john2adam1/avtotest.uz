"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { getDisplayImageUrl } from "@/lib/image-url"

interface CarouselImage {
  id: string
  image_url: string
  order_index: number
}

export function Carousel() {
  const { t } = useTranslation()
  const [images, setImages] = useState<CarouselImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const fetchImages = async () => {
    const { data } = await supabase
      .from("carousel_images")
      .select("id, image_url, order_index")
      .order("order_index")
    if (data) setImages(data)
  }

  useEffect(() => {
    setMounted(true)
    fetchImages()
  }, [])

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 2 + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 2) % images.length)
  }, [images.length])

  useEffect(() => {
    if (images.length === 0) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [images.length, next])

  if (!mounted || images.length === 0) return null

  // Show 2 images at a time
  const visibleImages = [
    images[currentIndex % images.length],
    images[(currentIndex + 1) % images.length],
  ]

  return (
    <section id="results" className="py-12 md:py-16 bg-[#eef8fd]">
      <div className="mx-auto max-w-6xl px-6 relative z-10">

        {/* NATIJALAR label */}
        <div className="flex justify-center mb-10">
          <span className="inline-block text-[#38bdf8] font-medium tracking-wide text-[15px] border-b-2 border-[#2dd4bf] pb-1 uppercase">
            {t("nav.results", "NATIJALAR")}
          </span>
        </div>

        {/* Carousel Row */}
        <div className="relative flex items-center gap-3 sm:gap-5">
          {/* Left Arrow */}
          <button
            onClick={prev}
            aria-label="Previous"
            className="shrink-0 w-9 h-9 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Images */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {visibleImages.map((img, idx) => (
              <div
                key={`${img.id}-${idx}`}
                className="relative bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 aspect-[4/3]"
              >
                <Image
                  src={getDisplayImageUrl(img.image_url)}
                  alt={`Natija ${currentIndex + idx + 1}`}
                  fill
                  unoptimized
                  className="object-contain p-2"
                />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={next}
            aria-label="Next"
            className="shrink-0 w-9 h-9 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(images.length / 2) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * 2)}
              className={`h-2 rounded-full transition-all duration-300 ${Math.floor(currentIndex / 2) === i
                ? "w-6 bg-blue-500"
                : "w-2 bg-slate-300"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

