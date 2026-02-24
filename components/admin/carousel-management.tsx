"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Trash2, ChevronUp, ChevronDown, Plus, Image as ImageIcon, ImagePlus, Loader2 } from "lucide-react"

interface CarouselImage {
  id: string
  image_url: string
  order_index: number
  created_at: string
}

export function CarouselManagement() {
  const [images, setImages] = useState<CarouselImage[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    let isMounted = true;
    const fetchImages = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("carousel_images")
        .select("*")
        .order("order_index")
      if (data && isMounted) setImages(data)
      if (isMounted) setLoading(false)
    }
    fetchImages()
    return () => { isMounted = false }
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
          title: "Xatolik",
          description: "Rasm faylini tanlang",
          variant: "destructive",
        })
        return
      }
      setImageFile(file)
      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
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

      return publicUrl
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "Rasm faylini yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleAdd = async () => {
    if (!imageFile) {
      toast({
        title: "Xatolik",
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
        title: "Xatolik",
        description: "Rasmni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Muvaffaqiyatli",
        description: "Rasm muvaffaqiyatli qo'shildi",
      })
      setImageFile(null)
      setPreviewUrl(null)
      fetchImages()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu rasmni o'chirishni xohlaysizmi?")) return

    const { error } = await supabase.from("carousel_images").delete().eq("id", id)

    if (error) {
      toast({
        title: "Xatolik",
        description: "Rasmni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Muvaffaqiyatli",
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

  const cleanUrl = (url: string) => {
    if (!url) return ""
    return url.trim()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Karousel Boshqaruvi</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Asosiy sahifadagi rasmlarni boshqarish</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-slate-400 text-[10px] font-bold uppercase shadow-sm">
          Jami: {images.length} ta rasm
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Upload Form */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl opacity-50" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                  <ImagePlus className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Yangi qo'shish</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="image-file" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Rasm fayli</Label>
                  <Input
                    id="image-file"
                    type="file"
                    accept="image/*"
                    className="h-12 bg-slate-50 border-slate-100 rounded-2xl text-slate-900 font-bold file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer pt-2 text-xs"
                    onChange={handleImageChange}
                  />
                </div>

                {previewUrl && (
                  <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-inner">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAdd}
                  disabled={!imageFile || uploading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all border-none disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Yuklanmoqda...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Qo'shish
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
            <h3 className="text-lg font-black text-slate-900 tracking-tight italic uppercase">Rasmlar Ro'yxati</h3>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Yuklanmoqda...</p>
              </div>
            ) : images.length === 0 ? (
              <div className="py-20 bg-white border border-slate-100 rounded-[2rem] text-center space-y-4 shadow-sm">
                <ImageIcon className="h-12 w-12 text-slate-200 mx-auto" />
                <p className="text-slate-400 font-bold italic">Hozircha rasmlar mavjud emas</p>
              </div>
            ) : (
              images.map((image, index) => (
                <div
                  key={image.id}
                  className="group flex flex-col sm:flex-row gap-4 bg-white border border-slate-100 hover:border-blue-100 p-4 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 shadow-sm"
                >
                  <div className="relative w-full sm:w-48 aspect-[16/9] sm:aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-inner shrink-0">
                    <img
                      src={cleanUrl(image.image_url)}
                      alt={`Carousel ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-[10px] font-black">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tasvir manzili</p>
                      <p className="text-xs font-bold text-slate-600 break-all line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-default">
                        {image.image_url}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-10 flex-1 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-100 rounded-xl font-bold transition-all"
                        onClick={() => handleReorder(image.id, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-10 flex-1 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-100 rounded-xl font-bold transition-all"
                        onClick={() => handleReorder(image.id, "down")}
                        disabled={index === images.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-10 w-12 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl flex items-center justify-center transition-all"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
