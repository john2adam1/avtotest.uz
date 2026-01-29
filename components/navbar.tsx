"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, LayoutDashboard } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-sky-500">Sarvar Avtotest</span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {isAdmin && (
            <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-sky-500">
              <Link href="/admin">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-sky-500 text-white text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm text-gray-700">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{displayName}</p>
                {userProfile?.phone && (
                  <p className="text-xs text-gray-500 mt-0.5">{userProfile.phone}</p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Sozlamalar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Chiqish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
