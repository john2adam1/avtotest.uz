"use client"

import { redirect, useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, Lock, Ticket } from "lucide-react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import type { User } from "@/lib/types"
import { PremiumAccessGuard } from "@/components/premium-access-guard"

export default function TicketsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [user, setUser] = useState<User | null>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [statsMap, setStatsMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push("/login")
        return
      }

      const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).single()
      if (!userData) {
        router.push("/login")
        return
      }

      if (userData.role === "admin") {
        router.push("/admin")
        return
      }

      setUser(userData)

      // Parallel fetching
      const [ticketsRes, statsRes, settingsRes] = await Promise.all([
        supabase.from("tickets").select("*"),
        supabase.from("ticket_statistics").select("ticket_id, percentage, correct_count, wrong_count").eq("user_id", authUser.id),
        supabase.from("settings").select("telegram_group_link").single()
      ])

      setTickets((ticketsRes.data || []).sort((a, b) => {
        const numA = parseInt(a.title.match(/\d+/)?.[0] || "0", 10)
        const numB = parseInt(b.title.match(/\d+/)?.[0] || "0", 10)
        return numA - numB
      }))

      const stats = (statsRes.data || []).reduce((acc, stat) => {
        acc[stat.ticket_id] = {
          percentage: stat.percentage,
          correct: stat.correct_count,
          wrong: stat.wrong_count
        }
        return acc
      }, {} as Record<string, any>)

      setStatsMap(stats)
      setLoading(false)
      // Save settings for telegram link
      if (settingsRes.data) {
        setTelegramLink(settingsRes.data.telegram_group_link)
      }
    }

    fetchData()
  }, [supabase, router])

  const [telegramLink, setTelegramLink] = useState("")

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e9f6ff]">
        <Navbar isAdmin={false} />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const hasAccess = hasActiveAccess(user)

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#eef6fc] text-foreground font-sans">
      <PremiumAccessGuard telegramLink={telegramLink} />

      {/* Top Header Row */}
      <div className="w-full px-4 sm:px-8 pt-6 pb-2">
        <Button asChild className="px-5 h-9 bg-[#1875d1] hover:bg-[#1565c0] text-white rounded font-normal text-sm gap-1.5 shadow-sm transition-all active:scale-95">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <ChevronLeft className="h-4 w-4" />
            Ortga
          </Link>
        </Button>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 max-w-[1200px] flex flex-col items-center">
        {/* Title */}
        <h1 className="text-[26px] font-normal text-slate-800 tracking-wide mb-10">Biletlar bo'yicha testlar</h1>

        {/* Grid Wrapper */}
        <div className="w-full max-w-[1000px] bg-[#eef6fc] border border-slate-300 rounded-[10px] p-6 lg:p-8">
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 sm:gap-4 md:gap-5">
            {tickets && tickets.length > 0 ? (
              tickets.map((ticket, index) => {
                const isPublic = ticket.is_public ?? false
                const canAccess = isPublic || hasAccess
                const ticketNumber = parseInt(ticket.title.match(/\d+/)?.[0] || String(index + 1), 10)

                return (
                  <Link
                    key={ticket.id}
                    href={canAccess ? `/test/ticket/${ticket.id}` : "?premium=required"}
                    className="relative flex flex-col items-center justify-center w-full aspect-[5/4] bg-white border border-slate-200 rounded-[6px] hover:bg-slate-50 hover:shadow-sm transition-all focus:outline-none"
                  >
                    <span className="text-[17px] font-normal text-slate-800">{ticketNumber}</span>
                    {!canAccess && (
                      <div className="absolute top-1.5 right-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-500/80" />
                      </div>
                    )}
                  </Link>
                )
              })
            ) : (
              <div className="col-span-full text-center py-20 px-6">
                <p className="text-slate-500 text-lg">
                  {t("dashboard.noTickets", "Hozircha biletlar mavjud emas")}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}