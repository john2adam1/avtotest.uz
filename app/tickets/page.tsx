"use client"

import { redirect, useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lock, ArrowLeft, Ticket } from "lucide-react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import type { User } from "@/lib/types"

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
      const [ticketsRes, statsRes] = await Promise.all([
        supabase.from("tickets").select("*").order("title"),
        supabase.from("ticket_statistics").select("ticket_id, percentage, correct_count, wrong_count").eq("user_id", authUser.id)
      ])

      setTickets(ticketsRes.data || [])

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
    }

    fetchData()
  }, [supabase, router])

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
    <div className="min-h-screen relative overflow-hidden text-foreground">
      <Navbar userEmail={user.email} isAdmin={user.role === "admin"} />

      <main className="container mx-auto px-6 py-12 max-w-4xl relative z-10">
        <div className="mb-10">
          <Button variant="ghost" asChild className="group text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl px-4 transition-all">
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t("common.back", "Orqaga")}
            </Link>
          </Button>
        </div>

        <div className="mb-12 text-center space-y-4 animate-float">
          <div className="inline-flex items-center justify-center p-5 bg-white/80 backdrop-blur-sm rounded-3xl border border-white shadow-xl shadow-premium-gold/5 mb-2">
            <Ticket className="h-10 w-10 text-premium-gold" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight italic uppercase drop-shadow-sm">{t("dashboard.ticketsDescription", "Imtihon Biletlari")}</h1>
          <p className="text-muted-foreground text-lg font-medium max-w-lg mx-auto">{t("dashboard.chooseMode")}</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 sm:p-12 hover-lift">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-6">
            {tickets && tickets.length > 0 ? (
              tickets.map((ticket, index) => {
                const isPublic = ticket.is_public ?? false
                const canAccess = isPublic || hasAccess
                const ticketNumber = index + 1
                const stats = statsMap[ticket.id]

                return (
                  <div key={ticket.id} className="relative group aspect-square">
                    <Button
                      asChild={canAccess}
                      variant="ghost"
                      disabled={!canAccess}
                      className={`w-full h-full p-4 rounded-3xl transition-all duration-300 flex flex-col items-center justify-center gap-1 shadow-md border-2 ${canAccess
                        ? "bg-premium-gold border-premium-gold shadow-premium-gold/20 hover:scale-110 active:scale-95 text-white"
                        : "bg-muted/50 border-border opacity-60 cursor-not-allowed"
                        }`}
                    >
                      {canAccess ? (
                        <Link href={`/test/ticket/${ticket.id}`} className="flex flex-col items-center justify-center w-full h-full">
                          <span className="text-2xl font-black tracking-tighter italic">{ticketNumber}</span>
                          {stats && (
                            <div className="flex gap-1.5 text-[9px] mt-1 font-black uppercase tracking-widest opacity-90">
                              <span className="text-green-800">{stats.correct}</span>
                              <span className="text-white/40">|</span>
                              <span className="text-red-800">{stats.wrong}</span>
                            </div>
                          )}
                        </Link>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-2xl font-black text-muted-foreground/30 italic">{ticketNumber}</span>
                          <Lock className="h-3 w-3 mt-1 text-muted-foreground/30" />
                        </div>
                      )}
                    </Button>
                    {
                      !isPublic && !hasAccess && (
                        <div className="absolute -top-1.5 -right-1.5 bg-premium-gold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white z-10">
                          <Lock className="h-3 w-3 text-white" />
                        </div>
                      )
                    }
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-20 px-6 space-y-4">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-10 w-10 text-muted-foreground/20" />
                </div>
                <p className="text-muted-foreground/50 text-xl font-bold italic">
                  {t("dashboard.noTickets", "Hozircha biletlar mavjud emas")}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div >
  )
}