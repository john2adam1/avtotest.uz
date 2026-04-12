"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Crown, User as UserIcon, Globe, Headset, User } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useTranslation } from "react-i18next"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

interface NavbarProps {
  userEmail?: string
  isAdmin?: boolean
}

export function Navbar({ userEmail, isAdmin }: NavbarProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [mounted, setMounted] = useState(false)
  const [userProfile, setUserProfile] = useState<{ id?: string, firstName?: string, lastName?: string, phone?: string } | null>(null)
  const [telegramLink, setTelegramLink] = useState("https://t.me/yourusername")
  const [contactPhone, setContactPhone] = useState("+998 78 555 31 90")

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      let profileData = null
      let link = "https://t.me/yourusername"

      if (user) {
        const { data: dbUser } = await supabase
          .from("users")
          .select("first_name, last_name, phone")
          .eq("id", user.id)
          .single()

        if (dbUser) {
          profileData = {
            id: user.id,
            firstName: dbUser.first_name,
            lastName: dbUser.last_name,
            phone: dbUser.phone
          }
        }
      }

      const { data: contactData } = await supabase
        .from("site_content")
        .select("content")
        .eq("type", "contact")
        .maybeSingle()

      if (contactData?.content?.telegram_link) {
        link = contactData.content.telegram_link
      }

      if (contactData?.content?.phone) {
        setContactPhone(contactData.content.phone)
      }

      // Batch updates at the end
      setUserProfile(profileData)
      setTelegramLink(link)
      setMounted(true)
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("deviceId")
    }
    router.push("/login")
  }

  const displayName = (userProfile?.firstName || userProfile?.lastName)
    ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim()
    : t("nav.account", "Foydalanuvchi")

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-3 backdrop-blur-md bg-white/50 border-b border-white/20">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 hover:scale-105 transition-all group">
          <div className="relative w-40 h-10">
            <Image
              src="/images/logo.jpg"
              alt="Sarvar AvtoTest"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {mounted && (
          <div className="flex items-center gap-3">
            {/* Premium Crown Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-16 w-16 text-premium-gold hover:bg-premium-gold/10 transition-all hover:scale-110">
                  <Crown className="h-12 w-12 fill-premium-gold" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-[3rem] p-10 bg-white border-none shadow-2xl">
                <DialogHeader className="space-y-6">
                  <div className="mx-auto w-24 h-24 bg-premium-gold/10 rounded-[2.5rem] flex items-center justify-center shadow-lg shadow-premium-gold/10">
                    <Crown className="h-12 w-12 text-premium-gold fill-premium-gold" />
                  </div>
                  <div className="space-y-2">
                    <DialogTitle className="text-3xl font-black text-center text-foreground italic uppercase tracking-tighter">{t("subscription.premium", "PREMIUM OBUNA")}</DialogTitle>
                    <p className="text-muted-foreground text-center font-bold text-lg leading-relaxed">
                      {t("subscription.premiumDescription", "Barcha biletlar, tasodifiy testlar va batafsil tushuntirishlarga to'liq kirish huquqiga ega bo'ling!")}
                    </p>
                  </div>
                </DialogHeader>
                <div className="mt-10 space-y-4">
                  <Button asChild className="w-full h-20 bg-premium-gold hover:bg-premium-gold/90 text-white font-black rounded-3xl shadow-2xl shadow-premium-gold/20 uppercase tracking-widest text-xl italic transition-all active:scale-95 border-none">
                    <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                      {t("subscription.buySubscription", "Obunani sotib olish")}
                    </a>
                  </Button>
                  <DialogClose asChild>
                    <Button variant="ghost" className="w-full h-12 text-muted-foreground/40 font-bold uppercase tracking-widest text-xs hover:bg-muted rounded-2xl">{t("common.close", "Keyinroq")}</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full overflow-hidden border border-border p-0 hover:border-primary/20">
                  <img
                    src={i18n.language === "uz_cyrl" ? "https://flagcdn.com/w80/uz.png" : "https://flagcdn.com/w80/uz.png"}
                    alt="Language"
                    className="w-full h-full object-cover"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-[#f5f5f5] border-none p-0 overflow-hidden shadow-xl rounded-lg">
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage("uz")}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${i18n.language === "uz" ? "bg-white" : "hover:bg-white/50"}`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200">
                    <img src="https://flagcdn.com/w80/uz.png" alt="uz" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-lg font-medium text-slate-900 leading-none">Uzbek</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage("uz_cyrl")}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${i18n.language === "uz_cyrl" ? "bg-white" : "hover:bg-white/50"}`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200">
                    <img src="https://flagcdn.com/w80/uz.png" alt="uz_cyrl" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-lg font-medium text-slate-900 leading-none">Узбек</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-10 w-10 text-primary-foreground bg-primary rounded-full hover:bg-primary/90 shadow-lg shadow-primary/20">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-white border-none p-0 overflow-hidden rounded-2xl shadow-2xl text-foreground">
                <div className="p-4 space-y-4">
                  {/* User Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <User className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="font-bold text-slate-800 text-lg leading-tight truncate">{displayName}</p>
                      {userProfile?.phone && (
                        <p className="text-sm text-slate-500 mt-1 font-medium">{userProfile.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 -mx-4" />

                  {/* support Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      <Headset className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="font-bold text-slate-800 text-lg leading-tight uppercase tracking-tight">Aloqa markazi:</p>
                      <a href={`tel:${contactPhone.replace(/\s+/g, "")}`} className="text-sm text-slate-500 mt-1 font-medium hover:text-primary transition-colors">
                        {contactPhone}
                      </a>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 -mx-4" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-2 py-1 text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3 p-2">
                      <LogOut className="h-5 w-5" />
                      <span className="text-xl font-bold">Log out</span>
                    </div>
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )
}
