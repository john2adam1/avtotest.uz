"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Crown, User as UserIcon } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [mounted, setMounted] = useState(false)
  const [userProfile, setUserProfile] = useState<{ firstName?: string, lastName?: string, phone?: string } | null>(null)
  const [telegramLink, setTelegramLink] = useState("https://t.me/yourusername")

  useEffect(() => {
    setMounted(true)
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: dbUser } = await supabase
          .from("users")
          .select("first_name, last_name, phone")
          .eq("id", user.id)
          .single()

        if (dbUser) {
          setUserProfile({
            firstName: dbUser.first_name,
            lastName: dbUser.last_name,
            phone: dbUser.phone
          })
        }
      }

      const { data: contactData } = await supabase
        .from("site_content")
        .select("content")
        .eq("type", "contact")
        .maybeSingle()

      if (contactData?.content?.telegram_link) {
        setTelegramLink(contactData.content.telegram_link)
      }
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

  if (!mounted) return null

  const displayName = (userProfile?.firstName || userProfile?.lastName)
    ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim()
    : "Foydalanuvchi"

  return (
    <header className="sticky top-0 z-50 px-4 py-4 w-full">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* New Logo matching the image */}
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 hover:scale-105 transition-all group">
          <div className="text-blue-700 font-black">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 10V15H15V35H25V15H35V10H5Z" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Tezkor</span>
            <span className="text-base font-bold text-slate-800 tracking-tight uppercase">Avtotest</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Premium Crown Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-10 w-10 text-amber-500 hover:bg-amber-50 transition-all hover:scale-110">
                <Crown className="h-6 w-6 fill-amber-500" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-[3rem] p-10 bg-white border-none shadow-2xl">
              <DialogHeader className="space-y-6">
                <div className="mx-auto w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <Crown className="h-12 w-12 text-amber-500 fill-amber-500" />
                </div>
                <div className="space-y-2">
                  <DialogTitle className="text-3xl font-black text-center text-slate-900 italic uppercase tracking-tighter">PREMIUM OBUNA</DialogTitle>
                  <p className="text-slate-500 text-center font-bold text-lg leading-relaxed">
                    Barcha biletlar, tasodifiy testlar va batafsil tushuntirishlarga to'liq kirish huquqiga ega bo'ling!
                  </p>
                </div>
              </DialogHeader>
              <div className="mt-10 space-y-4">
                <Button asChild className="w-full h-20 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-3xl shadow-2xl shadow-amber-500/20 uppercase tracking-widest text-xl italic transition-all active:scale-95">
                  <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                    Obunani sotib olish
                  </a>
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost" className="w-full h-12 text-slate-400 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl">Keyinroq</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>

          {/* Language Flag (Non-functional placeholder for UI) */}
          <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full overflow-hidden border border-slate-100 p-0 hover:border-blue-200">
            <img
              src="https://flagcdn.com/w80/uz.png"
              alt="Uzbekistan"
              className="w-full h-full object-cover"
            />
          </Button>

          {/* User Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-10 w-10 text-white bg-blue-500 rounded-full hover:bg-blue-600 shadow-lg shadow-blue-500/20">
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white border-slate-100 p-2 rounded-2xl shadow-3xl text-slate-800">
              <div className="px-4 py-3 mb-2 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-black text-slate-900 truncate text-base">{displayName}</p>
                {userProfile?.phone && (
                  <p className="text-xs text-slate-500 mt-0.5 tracking-wider font-semibold">{userProfile.phone}</p>
                )}
              </div>

              <DropdownMenuSeparator />

              <div className="space-y-1">
                <DropdownMenuItem onClick={handleLogout} className="p-0 border-none focus:bg-destructive/10 rounded-xl">
                  <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-destructive/10 hover:text-destructive font-black transition-all h-11 border-none bg-transparent">
                    <LogOut className="h-4 w-4" />
                    Chiqish
                  </Button>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
