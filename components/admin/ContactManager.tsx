"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function ContactManager() {
  const [phone, setPhone] = useState("")
  const [telegram, setTelegram] = useState("")
  const [telegramLink, setTelegramLink] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchContact()
  }, [])

  const fetchContact = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("type", "contact")
      .maybeSingle()

    if (!error && data?.content) {
      setPhone(data.content.phone || "")
      setTelegram(data.content.telegram || "")
      setTelegramLink(data.content.telegram_link || "")
      setAddress(data.content.address || "")
    }
    setLoading(false)
  }

  const handleSave = async () => {
    const newContent = {
      phone,
      telegram,
      telegram_link: telegramLink,
      address,
    }

    const { data: existing } = await supabase
      .from("site_content")
      .select("id")
      .eq("type", "contact")
      .maybeSingle()

    let error
    if (existing) {
      const { error: updateError } = await supabase
        .from("site_content")
        .update({ content: newContent })
        .eq("type", "contact")
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("site_content")
        .insert({ type: "contact", content: newContent })
      error = insertError
    }

    if (!error) {
      toast({
        title: "Success",
        description: "Bog'lanish ma'lumotlari muvaffaqiyatli yangilandi",
      })
    } else {
      toast({
        title: "Error",
        description: error.message || "Bog'lanish ma'lumotlarini yangilashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }


  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="pb-4 border-b-2 border-gray-300">
        <h2 className="text-3xl font-bold uppercase tracking-wide">Bog'lanish ma'lumotlari</h2>
        <p className="text-gray-500 text-lg">Bog'lanish ma'lumotlarini boshqarish</p>
      </div>

      <div className="space-y-8 bg-white border-2 border-gray-300 p-10">
        <div className="space-y-3">
          <Label htmlFor="phone" className="text-xl font-bold uppercase">Telefon raqami</Label>
          <Input
            id="phone"
            className="h-14 rounded-none border-2 border-gray-300 text-xl font-bold focus:border-[#1976d2]"
            placeholder="+998901234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="telegram" className="text-xl font-bold uppercase">Telegram foydalanuvchi nomi</Label>
          <Input
            id="telegram"
            className="h-14 rounded-none border-2 border-gray-300 text-xl font-bold focus:border-[#1976d2]"
            placeholder="e.g., @yourusername"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="telegram-link" className="text-xl font-bold uppercase">Telegram Link</Label>
          <Input
            id="telegram-link"
            className="h-14 rounded-none border-2 border-gray-300 text-xl font-bold focus:border-[#1976d2]"
            placeholder="https://t.me/yourusername"
            value={telegramLink}
            onChange={(e) => setTelegramLink(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="address" className="text-xl font-bold uppercase">Manzil</Label>
          <Input
            id="address"
            className="h-14 rounded-none border-2 border-gray-300 text-xl font-bold focus:border-[#1976d2]"
            placeholder="Manzilni kiriting"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSave}
          className="w-full h-16 bg-[#1976d2] text-white text-2xl font-black uppercase tracking-widest mt-6"
        >
          Bog'lanish ma'lumotlarini saqlash
        </Button>
      </div>
    </div>
  )
}
