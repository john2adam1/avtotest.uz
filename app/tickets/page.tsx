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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-primary/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob" />
      <div className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] bg-sky-500/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-2000" />

      <Navbar userEmail={user.email} isAdmin={userData.role === "admin"} />

      <main className="container mx-auto px-6 py-12 max-w-5xl relative z-10">
        <div className="mb-10">
          <Button variant="ghost" asChild className="group text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Orqaga
            </Link>
          </Button>
        </div>

        <div className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20 shadow-xl shadow-sky-500/5 mb-2">
            <Ticket className="h-10 w-10 text-sky-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Biletlar bo'yicha testlar</h1>
          <p className="text-slate-400 text-lg font-medium max-w-lg mx-auto">Biletni tanlang va bilimingizni sinang</p>
        </div>

        <Card className="glass-dark border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-3xl">
          <CardContent className="p-0">
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
                        className={`w-full h-full p-4 rounded-3xl transition-all duration-300 flex flex-col items-center justify-center gap-1 shadow-lg border-2 ${canAccess
                          ? "bg-white/5 border-white/5 hover:border-primary hover:bg-white/10 hover:scale-110 active:scale-95 text-white"
                          : "bg-white/5 border-transparent opacity-40 cursor-not-allowed"
                          }`}
                      >
                        {canAccess ? (
                          <Link href={`/test/ticket/${ticket.id}`} className="flex flex-col items-center justify-center w-full h-full">
                            <span className="text-2xl font-black tracking-tighter">{ticketNumber}</span>
                            {stats && (
                              <div className="flex gap-1.5 text-[10px] sm:text-[10px] mt-1 font-black uppercase tracking-widest opacity-80">
                                <span className="text-success">{stats.correct}</span>
                                <span className="text-slate-700">|</span>
                                <span className="text-destructive">{stats.wrong}</span>
                              </div>
                            )}
                          </Link>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-slate-700">{ticketNumber}</span>
                            <Lock className="h-4 w-4 mt-1 text-slate-800" />
                          </div>
                        )}
                      </Button>
                      {
                        !isPublic && (
                          <div className="absolute -top-2 -right-1 bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg shadow-amber-500/20 border-2 border-slate-900 z-10">
                            <Lock className="h-3 w-3 text-white" />
                          </div>
                        )
                      }
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-20 px-6 space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket className="h-10 w-10 text-slate-700" />
                  </div>
                  <p className="text-slate-500 text-xl font-bold">
                    Hozircha biletlar mavjud emas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div >
  )
}