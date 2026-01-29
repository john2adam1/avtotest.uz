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
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    const { data } = await supabase
      .from("carousel_images")
      .select("id, image_url, order_index")
      .order("order_index")

    if (data) setImages(data)
  }

  useEffect(() => {
    if (images.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [images.length])

  if (images.length === 0) return null

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-background/80 to-background/40">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold mb-8 sm:mb-12 text-foreground">
          {t("landing.results")}
        </h2>

        <div className="relative overflow-hidden rounded-3xl border border-gray-200/20 shadow-2xl bg-background/50 backdrop-blur-lg">
          <div
            className="flex transition-transform duration-700 ease-in-out h-[250px] sm:h-[350px] md:h-[450px]"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((img, index) => (
              <div key={img.id} className="relative w-full h-full flex-shrink-0 px-2 sm:px-4 py-2">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-purple-200/5 to-transparent opacity-0 group-hover:opacity-40 transition-all rounded-2xl" />
                <Image
                  src={img.image_url}
                  alt={`Carousel image ${index + 1}`}
                  fill
                  className="object-contain rounded-2xl transition-transform duration-500 hover:scale-105 shadow-lg"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          {/* Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${index === currentIndex ? "w-6 bg-primary" : "w-2 bg-primary/40"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
