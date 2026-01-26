"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, LogOut, Settings, LayoutDashboard } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavbarProps {
  userEmail?: string
  isAdmin?: boolean
}

export function Navbar({ userEmail, isAdmin }: NavbarProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [mounted, setMounted] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<"uz-lat" | "uz-cyr" | "ru">("uz-lat")
  const [userProfile, setUserProfile] = useState<{ firstName?: string, lastName?: string, phone?: string } | null>(null)

  useEffect(() => {
    setMounted(true)
    // Load language from user settings
    const loadLanguage = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: settings } = await supabase
          .from("user_settings")
          .select("language")
          .eq("user_id", user.id)
          .single()
        if (settings?.language) {
          setCurrentLanguage(settings.language as "uz-lat" | "uz-cyr" | "ru")
        }
      }
    }
    loadLanguage()
  }, [supabase])

  useEffect(() => {
    const verifyDevice = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Fetch user profile details
        const { data: dbUser } = await supabase
          .from("users")
          .select("id, role, active_device_id, first_name, last_name, phone")
          .eq("id", user.id)
          .single()

        if (dbUser) {
          setUserProfile({
            firstName: dbUser.first_name,
            lastName: dbUser.last_name,
            phone: dbUser.phone
          })
        }

        if (!dbUser || dbUser.role === "admin") return

        if (!dbUser || dbUser.role === "admin") return

        if (typeof window === "undefined") return

        const localDeviceId = window.localStorage.getItem("deviceId")

        if (dbUser.active_device_id && dbUser.active_device_id !== localDeviceId) {
          await supabase.auth.signOut()
          window.localStorage.removeItem("deviceId")
          router.push("/login?session=conflict")
        }
      } catch {
        // Fail-safe: do nothing on error
      }
    }

    verifyDevice()
  }, [router, supabase])

  const handleLanguageChange = async (lang: "uz-lat" | "uz-cyr" | "ru") => {
    setCurrentLanguage(lang)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      // Update or create user settings
      const { data: existing } = await supabase
        .from("user_settings")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (existing) {
        await supabase
          .from("user_settings")
          .update({ language: lang })
          .eq("user_id", user.id)
      } else {
        await supabase.from("user_settings").insert({
          user_id: user.id,
          language: lang,
        })
      }
      router.refresh()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("deviceId")
    }
    router.push("/login")
  }

  const languageLabels = {
    "uz-lat": "O'zbek (Lotin)",
    "uz-cyr": "Ўзбек (Кирилл)",
    "ru": "Русский",
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950 px-4">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-white" />
          <span className="text-lg font-bold font-heading tracking-tight text-white uppercase">Sarvar Avtotest</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <div className="h-6 w-[1px] bg-zinc-800 mx-2" />

          {mounted && (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-900">
                  <Link href="/admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}

              <div className="flex items-center gap-2 px-3 h-9 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium">
                <Avatar className="h-5 w-5 bg-zinc-700">
                  <AvatarFallback className="bg-transparent text-[10px] text-white">{userEmail?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                {(userProfile?.firstName || userProfile?.lastName)
                  ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim()
                  : "Foydalanuvchi"}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-zinc-300 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white h-9 gap-2"
              >
                <LogOut className="h-4 w-4" />
                Chiqish
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
