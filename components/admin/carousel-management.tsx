"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react"
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight italic uppercase">Karousel Boshqaruvi</h2>
          <p className="text-slate-400 text-xs font-medium mt-1">Bosh sahifadagi slayder rasmlarini sozlash</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest">
          Jami: {images.length} ta rasm
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Upload Form */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
          <div className="glass-dark border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-black text-white tracking-tight uppercase">Yangi rasm</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Rasm faylini tanlang</Label>
                  <div className="relative group/input">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="h-14 bg-white/5 border-white/10 rounded-xl text-white font-bold px-4 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer pt-4 text-xs"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAdd}
                  disabled={uploading || !imageFile}
                  className="h-14 w-full bg-primary hover:bg-primary/90 text-white font-black text-xs rounded-xl shadow-xl shadow-primary/20 transition-all uppercase tracking-widest border-none group"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Yuklanmoqda...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
                      <span>Qo'shish</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-white tracking-tight italic">Mavjud Rasmlar</h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 glass-dark border border-white/5 rounded-3xl">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Yuklanmoqda...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="py-20 glass-dark border border-white/5 rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Trash2 className="h-8 w-8 text-slate-800" />
              </div>
              <p className="text-slate-500 text-xl font-black italic tracking-tighter">Hozircha rasmlar mavjud emas.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {images.map((image, index) => (
                <div key={image.id} className="group relative glass-dark border border-white/5 bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:translate-y-[-2px]">
                  <div className="aspect-[16/9] relative overflow-hidden rounded-xl border border-white/5 shadow-inner">
                    <Image
                      src={image.image_url}
                      alt={`Carousel ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-2 left-2 h-7 w-7 bg-primary/20 backdrop-blur-md rounded-lg flex items-center justify-center font-black text-white text-[10px] border border-primary/30 shadow-lg transform -translate-x-10 group-hover:translate-x-0 transition-transform duration-500">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="p-2 flex items-center justify-between mt-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">Slayd {index + 1}</span>
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        className="h-8 w-8 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center p-0"
                        onClick={() => handleReorder(image.id, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/5 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center p-0"
                        onClick={() => handleReorder(image.id, "down")}
                        disabled={index === images.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg border border-destructive/20 transition-all active:scale-95 flex items-center justify-center p-0"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
