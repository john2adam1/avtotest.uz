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
    return <div className="text-center py-8">Yuklanmoqda...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="pb-4 border-b-2 border-gray-300">
        <h2 className="text-3xl font-bold uppercase tracking-wide">Narxlar boshqaruvi</h2>
        <p className="text-gray-500 text-lg">Bosh sahifadagi narxlar bo'limini boshqarish</p>
      </div>

      <div className="space-y-8 bg-white border-2 border-gray-300 p-10">
        <div className="space-y-3">
          <Label htmlFor="discount-percent" className="text-xl font-bold uppercase">Chegirma foizi (%)</Label>
          <Input
            id="discount-percent"
            className="h-14 rounded-none border-2 border-gray-300 text-2xl font-black focus:border-[#1976d2]"
            placeholder="33"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="original-price" className="text-xl font-bold uppercase">Asl narx (so'm)</Label>
          <Input
            id="original-price"
            className="h-14 rounded-none border-2 border-gray-300 text-2xl font-black focus:border-[#1976d2]"
            placeholder="300000"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="discounted-price" className="text-xl font-bold uppercase">Chegirmali narx (so'm)</Label>
          <Input
            id="discounted-price"
            className="h-14 rounded-none border-2 border-gray-300 text-2xl font-black focus:border-[#1976d2]"
            placeholder="200000"
            value={discountedPrice}
            onChange={(e) => setDiscountedPrice(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSave}
          className="w-full h-16 bg-[#1976d2] text-white text-2xl font-black uppercase tracking-widest mt-6"
        >
          Narxlarni saqlash
        </Button>
      </div>
    </div>
  )
}
