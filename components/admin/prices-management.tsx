"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Save, Sparkles, Loader2, Info } from "lucide-react"

export function PricesManagement() {
  const [originalPrice, setOriginalPrice] = useState("")
  const [discountedPrice, setDiscountedPrice] = useState("")
  const [discountPercent, setDiscountPercent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    let isMounted = true;
    const fetchPrices = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("type", "prices")
        .maybeSingle()

      if (data?.content && isMounted) {
        setOriginalPrice(data.content.original_price || "")
        setDiscountedPrice(data.content.discounted_price || "")
        setDiscountPercent(data.content.discount_percent || "")
      }
    }
    fetchPrices()
    return () => { isMounted = false }
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
    setSaving(true)
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
        title: "Xatolik",
        description: error.message || "Narxlarni yangilashda xatolik yuz berdi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Muvaffaqiyatli",
        description: "Narxlar muvaffaqiyatli yangilandi",
      })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white border border-slate-100 rounded-[4rem] shadow-sm">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
        <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">Yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Narxlar Sozlamalari</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Platforma tariflari va aksiyalarni boshqarish</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-slate-400 text-[10px] font-bold uppercase shadow-sm">
          Aktiv tarif: 1 OY
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl opacity-50" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl opacity-50" />

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Obuna narxlari</h3>
                <p className="text-slate-500 text-xs font-medium italic">Foydalanuvchilar uchun ko'rinadigan narxlar</p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="discount-percent" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Chegirma (%)</Label>
                <div className="relative">
                  <Input
                    id="discount-percent"
                    className="h-14 bg-blue-50 border-blue-100 rounded-xl text-3xl font-black text-blue-600 px-6 focus:ring-blue-500/50 transition-all text-center"
                    placeholder="33"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-20">
                    <span className="text-lg font-black text-slate-900">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="original-price" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asl narx (so'm)</Label>
                <Input
                  id="original-price"
                  className="h-14 bg-slate-50 border-slate-100 rounded-xl text-xl font-black text-slate-900 px-6 focus:ring-blue-500/50 transition-all text-center line-through decoration-red-500 decoration-2 opacity-50"
                  placeholder="300000"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discounted-price" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Yangi narx (so'm)</Label>
                <Input
                  id="discounted-price"
                  className="h-14 bg-emerald-50 border-emerald-100 rounded-xl text-xl font-black text-emerald-600 px-6 focus:ring-emerald-500/50 transition-all text-center shadow-lg shadow-emerald-500/5"
                  placeholder="200000"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-14 px-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all border-none group uppercase tracking-widest disabled:opacity-50"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saqlanmoqda...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    Saqlash
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="h-10 w-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
          <Info className="h-5 w-5 text-blue-600" />
        </div>
        <p className="text-slate-600 font-bold text-center md:text-left leading-relaxed text-xs">
          Bu narxlar barcha foydalanuvchilar obuna bo'lish sahifasida va bosh sahifada darhol aks ettiriladi.
          To'g'riligini qayta-qayta tekshirib ko'ring.
        </p>
      </div>
    </div>
  )
}
