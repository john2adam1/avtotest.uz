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
          <h2 className="text-xl font-black text-white tracking-tight italic uppercase">Bog'lanish Sozlamalari</h2>
          <p className="text-slate-400 text-xs font-medium mt-1">Platforma kontakt ma'lumotlarini boshqarish</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-12">
          <div className="glass-dark border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute -left-20 -top-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />

            <div className="relative z-10 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Telefon Raqami</Label>
                <Input
                  id="phone"
                  className="h-11 bg-white/5 border-white/10 rounded-xl text-sm font-bold text-white px-5 focus:ring-primary/50 transition-all font-mono"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Telegram Username</Label>
                <div className="relative">
                  <Input
                    id="telegram"
                    className="h-11 bg-white/5 border-white/10 rounded-xl text-sm font-bold text-white pl-10 pr-5 focus:ring-primary/50 transition-all"
                    placeholder="@username"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none opacity-40">
                    <span className="text-sm font-bold text-primary">@</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="telegram-link" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">To'liq Telegram Havolasi</Label>
                <Input
                  id="telegram-link"
                  className="h-11 bg-white/5 border-white/10 rounded-xl text-sm font-bold text-white px-5 focus:ring-primary/50 transition-all"
                  placeholder="https://t.me/yourusername"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Ofis Manzili / Kontakt Matni</Label>
                <Input
                  id="address"
                  className="h-11 bg-white/5 border-white/10 rounded-xl text-sm font-bold text-white px-5 focus:ring-primary/50 transition-all"
                  placeholder="Toshkent sh., Yunusobod tumani..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center border-t border-white/5 pt-6">
              <Button
                onClick={handleSave}
                className="h-12 px-10 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-xl shadow-xl shadow-primary/20 transition-all border-none group uppercase tracking-widest"
              >
                Saqlash
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
