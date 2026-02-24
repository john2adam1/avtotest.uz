// app/tickets/page.tsx
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, ArrowLeft, Ticket } from "lucide-react"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TicketsPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userData) redirect("/login")

  // Redirect admin to admin page instead of user tickets
  if (userData.role === "admin") {
    redirect("/admin")
  }

  const hasAccess = hasActiveAccess(userData)

  // Fetch all tickets
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .order("title")

  // Fetch user stats for tickets
  const { data: ticketStats } = await supabase
    .from("ticket_statistics")
    .select("ticket_id, percentage, correct_count, wrong_count")
    .eq("user_id", user.id)

  const statsMap = (ticketStats || []).reduce((acc, stat) => {
    acc[stat.ticket_id] = {
      percentage: stat.percentage,
      correct: stat.correct_count,
      wrong: stat.wrong_count
    }
    return acc
  }, {} as Record<string, { percentage: number; correct: number; wrong: number }>)

  return (
    <div className="min-h-screen bg-[#e9f6ff] relative overflow-hidden">
      <Navbar userEmail={user.email} isAdmin={userData.role === "admin"} />

      <main className="container mx-auto px-6 py-12 max-w-4xl relative z-10">
        <div className="mb-10">
          <Button variant="ghost" asChild className="group text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl px-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Orqaga
            </Link>
          </Button>
        </div>

        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-5 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-500/5 mb-2">
            <Ticket className="h-10 w-10 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Imtihon Biletlari</h1>
          <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto">Biletni tanlang va bilimingizni sinang</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-blue-500/5">
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
                        ? "bg-[#F9C333] border-[#F9C333] shadow-yellow-100 hover:scale-110 active:scale-95 text-white"
                        : "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed"
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
                          <span className="text-2xl font-black text-slate-300 italic">{ticketNumber}</span>
                          <Lock className="h-3 w-3 mt-1 text-slate-300" />
                        </div>
                      )}
                    </Button>
                    {
                      !isPublic && !hasAccess && (
                        <div className="absolute -top-1.5 -right-1.5 bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white z-10">
                          <Lock className="h-3 w-3 text-white" />
                        </div>
                      )
                    }
                  </div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-20 px-6 space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-10 w-10 text-slate-200" />
                </div>
                <p className="text-slate-400 text-xl font-bold italic">
                  Hozircha biletlar mavjud emas
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div >
  )
}