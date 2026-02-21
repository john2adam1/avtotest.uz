"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface CarouselImage {
  id: string
  image_url: string
  order_index: number
}

import { useTranslation } from "react-i18next"

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

  useEffect(() => {
    if (images.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [images.length])

  if (!mounted) return null

  if (images.length === 0) return null

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <h2 className="text-center text-3xl md:text-5xl font-extrabold mb-16 text-white tracking-tight">
          {t("landing.results")}
        </h2>

        <div className="relative group overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl bg-white/5 glass-dark p-2 transition-all duration-500 hover:scale-[1.01]">
          {/* Background Decoration */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] opacity-20" />

          <div
            className="flex transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1) h-[300px] md:h-[600px]"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((img, index) => (
              <div key={img.id} className="relative w-full h-full flex-shrink-0 p-6">
                <div className="relative w-full h-full overflow-hidden rounded-[2rem]">
                  <Image
                    src={img.image_url}
                    alt={`Carousel image ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 relative z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-500 hover:bg-primary/50 ${index === currentIndex
                    ? "w-12 bg-primary shadow-lg shadow-primary/50"
                    : "w-2.5 bg-white/20"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
