// app/tickets/page.tsx
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, ArrowLeft } from "lucide-react"

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
    <div className="min-h-screen bg-background">
      <Navbar userEmail={user.email} isAdmin={userData.role === "admin"} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Orqaga
            </Link>
          </Button>
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Biletlar bo'yicha testlar</h1>
          <p className="text-muted-foreground">Biletni tanlang va testni boshlang</p>
        </div>

        <Card className="max-w-5xl mx-auto border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket, index) => {
                  const isPublic = ticket.is_public ?? false
                  const canAccess = isPublic || hasAccess
                  const ticketNumber = index + 1
                  const stats = statsMap[ticket.id]
                  const percentage = stats?.percentage

                  let bgClass = "bg-white border border-gray-300 hover:border-blue-500 text-gray-700"

                  // If we strictly follow the user request "Ticket statistics should appear on each ticket"
                  // and "Image 1" (which shows plain boxes), maybe they want the stats visible but subtle?
                  // The user uploaded an image of PLAIN boxes numbered 1-8. 
                  // But also said "Ticket statistics should appear on each ticket".
                  // I'll stick to a simple box design, but keep the small stats if available.

                  return (
                    <div key={ticket.id} className="relative aspect-square">
                      <Button
                        asChild={canAccess}
                        variant="ghost"
                        disabled={!canAccess}
                        className={`w-full h-full p-0 rounded-none border border-gray-300 hover:bg-blue-50 flex flex-col items-center justify-center gap-0 shadow-sm ${bgClass} ${!canAccess ? 'opacity-50 bg-gray-100' : ''}`}
                      >
                        {canAccess ? (
                          <Link href={`/test/ticket/${ticket.id}`} className="flex flex-col items-center justify-center w-full h-full">
                            <span className="text-xl font-bold text-gray-800">{ticketNumber}</span>
                            {stats && (
                              <div className="flex gap-1 text-[10px] sm:text-[10px] mt-1 font-medium opacity-80">
                                <span className="text-green-600">{stats.correct}</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-red-500">{stats.wrong}</span>
                              </div>
                            )}
                          </Link>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-xl font-medium text-gray-400">{ticketNumber}</span>
                            <Lock className="h-3 w-3 mt-1 text-gray-400" />
                          </div>
                        )}
                      </Button>
                      {
                        !isPublic && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 text-xs px-1"
                          >
                            Premium
                          </Badge>
                        )
                      }
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Hozircha biletlar mavjud emas
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div >
  )
}