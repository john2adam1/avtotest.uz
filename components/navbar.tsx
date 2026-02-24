"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Settings } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  const [userProfile, setUserProfile] = useState<{ firstName?: string, lastName?: string, phone?: string } | null>(null)

  useEffect(() => {
    setMounted(true)
    const fetchProfile = async () => {
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
    }
    fetchProfile()
  }, [supabase])

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
    <header className="sticky top-0 z-50 px-4 pt-4 transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 rounded-2xl glass-dark border-white/10 shadow-2xl backdrop-blur-xl">
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3 hover:scale-105 transition-all group">
          <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30">
            <span className="text-lg font-bold text-primary tracking-tighter">TA</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight hidden sm:inline">Tezkor Avtotest</span>
        </Link>

        <div className="flex items-center gap-4">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all outline-none">
                <span className="hidden md:inline text-sm font-bold text-slate-300">{displayName}</span>
                <Avatar className="h-8 w-8 rounded-xl border border-primary/20">
                  <AvatarFallback className="bg-primary/20 text-primary font-black text-sm rounded-xl uppercase">
                    {displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 glass-dark border-white/10 p-2 rounded-2xl shadow-3xl text-slate-200">
              <div className="px-4 py-3 mb-2 rounded-xl bg-white/5">
                <p className="font-bold text-white truncate text-base">{displayName}</p>
                {userProfile?.phone && (
                  <p className="text-xs text-slate-500 mt-0.5 tracking-wider font-semibold">{userProfile.phone}</p>
                )}
              </div>

              <DropdownMenuSeparator className="bg-white/5 my-1" />

              <div className="space-y-1">
                <DropdownMenuItem onClick={handleLogout} className="p-0 border-none focus:bg-destructive/10">
                  <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-destructive/10 hover:text-destructive font-bold transition-all h-11 border-none bg-transparent">
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
