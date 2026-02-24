"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function PricesManagement() {
  const [originalPrice, setOriginalPrice] = useState("")
  const [discountedPrice, setDiscountedPrice] = useState("")
  const [discountPercent, setDiscountPercent] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("type", "prices")
      .maybeSingle()

    if (data?.content) {
      setOriginalPrice(data.content.original_price || "")
      setDiscountedPrice(data.content.discounted_price || "")
      setDiscountPercent(data.content.discount_percent || "")
    }
    setLoading(false)
  }

  const handleSave = async () => {
    const content = {
      original_price: originalPrice,
      discounted_price: discountedPrice,
      discount_percent: discountPercent,
    }

    const { data: existing } = await supabase
      .from("site_content")
      .select("id")
      .eq("type", "prices")
      .maybeSingle()

    let error
    if (existing) {
      const { error: updateError } = await supabase
        .from("site_content")
        .update({ content })
        .eq("type", "prices")
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("site_content")
        .insert({ type: "prices", content })
      error = insertError
    }

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Narxlarni yangilashda xatolik yuz berdi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Narxlar muvaffaqiyatli yangilandi",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 glass-dark border border-white/5 rounded-[4rem]">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
        <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight italic uppercase">Narxlar Boshqaruvi</h2>
          <p className="text-slate-400 text-xs font-medium mt-1">Obuna narxlari va chegirmalarni sozlash</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-12">
          <div className="glass-dark border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />

            <div className="relative z-10 grid gap-8 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="discount-percent" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Chegirma (%)</Label>
                <div className="relative">
                  <Input
                    id="discount-percent"
                    className="h-14 bg-white/5 border-white/10 rounded-xl text-3xl font-black text-primary px-6 focus:ring-primary/50 transition-all text-center"
                    placeholder="33"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-20">
                    <span className="text-lg font-black text-white">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="original-price" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Asl narx (so'm)</Label>
                <Input
                  id="original-price"
                  className="h-14 bg-white/5 border-white/10 rounded-xl text-xl font-black text-white px-6 focus:ring-primary/50 transition-all text-center line-through decoration-destructive opacity-80"
                  placeholder="300000"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discounted-price" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Yangi narx (so'm)</Label>
                <Input
                  id="discounted-price"
                  className="h-14 bg-white/5 border-white/10 rounded-xl text-xl font-black text-success px-6 focus:ring-primary/50 transition-all text-center shadow-lg shadow-success/5"
                  placeholder="200000"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <Button
                onClick={handleSave}
                className="h-14 px-12 bg-primary hover:bg-primary/90 text-white text-base font-black rounded-2xl shadow-xl shadow-primary/20 transition-all border-none group uppercase tracking-widest"
              >
                Saqlash
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-dark border border-white/5 p-5 rounded-2xl bg-white/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
        <p className="text-slate-400 font-bold text-center md:text-left leading-relaxed text-xs">
          Bu narxlar barcha foydalanuvchilar obuna bo'lish sahifasida va bosh sahifada darhol aks ettiriladi.
          To'g'riligini qayta-qayta tekshirib ko'ring.
        </p>
      </div>
    </div>
  )
}
