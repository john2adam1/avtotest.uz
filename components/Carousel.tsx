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
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-center text-3xl md:text-5xl font-bold mb-16 text-primary">
          {t("landing.results")}
        </h2>

        <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-gray-50 shadow-xl bg-background">
          <div
            className="flex transition-transform duration-700 ease-in-out h-[300px] md:h-[500px]"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((img, index) => (
              <div key={img.id} className="relative w-full h-full flex-shrink-0 p-4">
                <Image
                  src={img.image_url}
                  alt={`Carousel image ${index + 1}`}
                  fill
                  className="object-contain rounded-2xl"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 rounded-full transition-all duration-300 ${index === currentIndex ? "w-10 bg-primary" : "w-3 bg-gray-200"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
