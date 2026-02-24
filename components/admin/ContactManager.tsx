"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Send, Phone, MapPin, Save, Info, Loader2 } from "lucide-react"

export default function ContactManager() {
  const [phone, setPhone] = useState("")
  const [telegram, setTelegram] = useState("")
  const [telegramLink, setTelegramLink] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    let isMounted = true;
    const fetchContact = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("site_content")
        .select("content")
        .eq("type", "contact")
        .maybeSingle()

      if (data?.content && isMounted) {
        setPhone(data.content.phone || "")
        setTelegram(data.content.telegram || "")
        setTelegramLink(data.content.telegram_link || "")
        setAddress(data.content.address || "")
      }
      if (isMounted) setLoading(false)
    }
    fetchContact()
    return () => { isMounted = false }
  }, [])

  const fetchContact = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("type", "contact")
      .maybeSingle()

    if (data?.content) {
      setPhone(data.content.phone || "")
      setTelegram(data.content.telegram || "")
      setTelegramLink(data.content.telegram_link || "")
      setAddress(data.content.address || "")
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const content = {
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
        .update({ content })
        .eq("type", "contact")
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("site_content")
        .insert({ type: "contact", content })
      error = insertError
    }

    if (error) {
      toast({
        title: "Xatolik",
        description: error.message || "Bog'lanish ma'lumotlarini yangilashda xatolik yuz berdi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Muvaffaqiyatli",
        description: "Bog'lanish ma'lumotlari muvaffaqiyatli yangilandi",
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
          <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Aloqa Sozlamalari</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Platformadagi bog'lanish ma'lumotlarini tahrirlash</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-slate-400 text-[10px] font-bold uppercase shadow-sm">
          Aktiv: Telegram
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl opacity-50" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl opacity-50" />

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Bog'lanish</h3>
                <p className="text-slate-500 text-xs font-medium italic">Foydalanuvchilar siz bilan qanday bog'lanadi?</p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefon raqami</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    className="h-12 bg-slate-50 border-slate-100 rounded-2xl text-slate-900 font-bold px-5 focus:ring-blue-500/50 focus:border-blue-600 transition-all shadow-inner"
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telegram" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telegram Username</Label>
                  <Input
                    id="telegram"
                    className="h-12 bg-slate-50 border-slate-100 rounded-2xl text-blue-600 font-bold px-5 focus:ring-blue-500/50 focus:border-blue-600 transition-all shadow-inner"
                    placeholder="@admin_user"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram_link" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telegram Link</Label>
                  <Input
                    id="telegram_link"
                    className="h-12 bg-slate-50 border-slate-100 rounded-2xl text-blue-600 font-bold px-5 focus:ring-blue-500/50 focus:border-blue-600 transition-all shadow-inner"
                    placeholder="https://t.me/admin"
                    value={telegramLink}
                    onChange={(e) => setTelegramLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Manzil (Matn)</Label>
                <div className="relative">
                  <Input
                    id="address"
                    className="h-12 bg-slate-50 border-slate-100 rounded-2xl text-slate-900 font-bold px-5 focus:ring-blue-500/50 focus:border-blue-600 transition-all shadow-inner"
                    placeholder="Toshkent shahri, Yunusobod..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
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
          Bu ma'lumotlar foydalanuvchilar obuna bo'lish sahifasida va footer qismida ko'rinadi.
        </p>
      </div>
    </div>
  )
}
