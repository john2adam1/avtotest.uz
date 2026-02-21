"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Trash2, ArrowUp, ArrowDown } from "lucide-react"
import Image from "next/image"

interface CarouselImage {
  id: string
  image_url: string
  order_index: number
  created_at: string
}

export function CarouselManagement() {
  const [images, setImages] = useState<CarouselImage[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("carousel_images")
      .select("*")
      .order("order_index")
    if (data) setImages(data)
    setLoading(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Rasm faylini tanlang",
          variant: "destructive",
        })
        return
      }
      setImageFile(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    setUploading(true)
    try {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `carousel-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `carousel/${fileName}`

      const { error: uploadError } = await supabase.storage.from("test-images").upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("test-images").getPublicUrl(filePath)

      setUploading(false)
      return publicUrl
    } catch (error: any) {
      setUploading(false)
      toast({
        title: "Error",
        description: error.message || "Rasm faylini yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
      return null
    }
  }

  const handleAdd = async () => {
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Rasm faylini tanlang",
        variant: "destructive",
      })
      return
    }

    const imageUrl = await uploadImage()
    if (!imageUrl) return

    const maxOrder = images.length > 0 ? Math.max(...images.map((img) => img.order_index)) : -1

    const { error } = await supabase.from("carousel_images").insert({
      image_url: imageUrl,
      order_index: maxOrder + 1,
    })

    if (error) {
      toast({
        title: "Error",
        description: "Rasmni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Rasm muvaffaqiyatli qo'shildi",
      })
      setImageFile(null)
      fetchImages()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu rasmni o'chirishni xohlaysizmi?")) return

    const { error } = await supabase.from("carousel_images").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Rasmni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Rasm muvaffaqiyatli o'chirildi",
      })
      fetchImages()
    }
  }

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const currentIndex = images.findIndex((img) => img.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const current = images[currentIndex]
    const target = images[newIndex]

    await supabase
      .from("carousel_images")
      .update({ order_index: target.order_index })
      .eq("id", current.id)

    await supabase
      .from("carousel_images")
      .update({ order_index: current.order_index })
      .eq("id", target.id)

    fetchImages()
  }

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="pb-4 border-b-2 border-gray-300">
          <h2 className="text-2xl font-bold uppercase tracking-wide">Karousel rasmlari qo'shish</h2>
          <p className="text-gray-500">Bosh sahifadagi karousel uchun rasmlar</p>
        </div>

        <div className="space-y-6 max-w-2xl">
          <div className="space-y-3">
            <Label htmlFor="image" className="text-lg font-bold">Rasm</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              className="h-14 border-2 border-gray-300 rounded-none bg-white p-2"
              onChange={handleImageChange}
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={uploading || !imageFile}
            className="h-14 px-10 bg-[#1976d2] text-white font-bold text-xl uppercase"
          >
            {uploading ? "Yuklanmoqda..." : "Rasm qo'shish"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="pb-4 border-b-2 border-gray-300">
          <h2 className="text-2xl font-bold uppercase tracking-wide">Karousel rasmlari ({images.length})</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xl font-bold">Yuklanmoqda...</div>
        ) : images.length === 0 ? (
          <div className="py-12 border-2 border-dashed border-gray-300 bg-white text-center text-xl font-bold text-gray-500 italic">
            Hozircha rasmlar mavjud emas
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div key={image.id} className="group relative border-2 border-gray-300 bg-white p-2 h-full">
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={image.image_url}
                    alt={`Carousel ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4 flex items-center justify-between border-t-2 border-gray-100 mt-2">
                  <span className="text-xl font-bold text-[#1976d2] uppercase tracking-tighter">Tartib: {index + 1}</span>
                  <div className="flex gap-2">
                    <Button
                      className="h-10 w-10 bg-gray-100 text-gray-700 border-2 border-gray-300 flex items-center justify-center p-0"
                      onClick={() => handleReorder(image.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-5 w-5" />
                    </Button>
                    <Button
                      className="h-10 w-10 bg-gray-100 text-gray-700 border-2 border-gray-300 flex items-center justify-center p-0"
                      onClick={() => handleReorder(image.id, "down")}
                      disabled={index === images.length - 1}
                    >
                      <ArrowDown className="h-5 w-5" />
                    </Button>
                    <Button
                      className="h-10 w-10 bg-red-50 text-red-600 border-2 border-red-200 flex items-center justify-center p-0"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
