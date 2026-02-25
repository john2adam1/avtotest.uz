"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Crown, User as UserIcon, Globe } from "lucide-react"
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
  const [userProfile, setUserProfile] = useState<{ firstName?: string, lastName?: string, phone?: string } | null>(null)
  const [telegramLink, setTelegramLink] = useState("https://t.me/yourusername")

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
          <div className="text-primary font-black">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 10V15H15V35H25V15H35V10H5Z" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-black text-foreground tracking-tighter uppercase italic">Sarvar</span>
            <span className="text-sm font-bold text-foreground/80 tracking-tight uppercase">AvtoTest</span>
          </div>
        </Link>

        {mounted && (
          <div className="flex items-center gap-3">
            {/* Premium Crown Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-10 w-10 text-premium-gold hover:bg-premium-gold/10 transition-all hover:scale-110">
                  <Crown className="h-6 w-6 fill-premium-gold" />
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
              <DropdownMenuContent align="center" className="w-40 bg-white border-border p-2 rounded-2xl shadow-3xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] px-3 py-2">{t("settings.language", "Tilni tanlang")}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage("uz")}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${i18n.language === "uz" ? "bg-primary/10 text-primary font-black" : "font-bold text-foreground hover:bg-muted"}`}
                >
                  <span className="text-base">Lotincha</span>
                  {i18n.language === "uz" && <div className="ml-auto w-2 h-2 rounded-full bg-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage("uz_cyrl")}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${i18n.language === "uz_cyrl" ? "bg-primary/10 text-primary font-black" : "font-bold text-foreground hover:bg-muted"}`}
                >
                  <span className="text-base">Кириллча</span>
                  {i18n.language === "uz_cyrl" && <div className="ml-auto w-2 h-2 rounded-full bg-primary" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-10 w-10 text-primary-foreground bg-primary rounded-full hover:bg-primary/90 shadow-lg shadow-primary/20">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white border-border p-2 rounded-2xl shadow-3xl text-foreground">
                <div className="px-4 py-3 mb-2 rounded-xl bg-muted border border-border">
                  <p className="font-black text-foreground truncate text-base">{displayName}</p>
                  {userProfile?.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5 tracking-wider font-semibold">{userProfile.phone}</p>
                  )}
                </div>

                <DropdownMenuSeparator />

                <div className="space-y-1">
                  <DropdownMenuItem onClick={handleLogout} className="p-0 border-none focus:bg-destructive/10 rounded-xl">
                    <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-destructive/10 hover:text-destructive font-black transition-all h-11 border-none bg-transparent">
                      <LogOut className="h-4 w-4" />
                      {t("auth.logout", "Chiqish")}
                    </Button>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )
}
