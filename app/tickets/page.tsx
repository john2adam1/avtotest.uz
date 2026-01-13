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
    .select("ticket_id, percentage")
    .eq("user_id", user.id)

  const statsMap = (ticketStats || []).reduce((acc, stat) => {
    acc[stat.ticket_id] = stat.percentage
    return acc
  }, {} as Record<string, number>)

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

        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {tickets && tickets.length > 0 ? (
                tickets.map((ticket, index) => {
                  const isPublic = ticket.is_public ?? false
                  const canAccess = isPublic || hasAccess
                  const ticketNumber = index + 1
                  const percentage = statsMap[ticket.id]

                  let buttonVariant = "default" as "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
                  if (!canAccess) buttonVariant = "outline"
                  else if (percentage !== undefined) {
                    if (percentage >= 90) buttonVariant = "default" // Green-ish usually (handled by class below if needed)
                    else if (percentage < 60) buttonVariant = "destructive"
                  }

                  let bgClass = ""
                  if (canAccess && percentage !== undefined) {
                    if (percentage >= 90) bgClass = "bg-green-600 hover:bg-green-700"
                    else if (percentage >= 70) bgClass = "bg-yellow-500 hover:bg-yellow-600"
                    else bgClass = "bg-red-500 hover:bg-red-600"
                  }

                  return (
                    <div key={ticket.id} className="relative">
                      <Button
                        asChild={canAccess}
                        variant={canAccess && !bgClass ? "default" : "outline"} // fallback variant
                        disabled={!canAccess}
                        className={`aspect-square h-16 sm:h-20 text-lg font-semibold w-full relative ${bgClass} ${!canAccess ? 'opacity-50' : ''}`}
                      >
                        {canAccess ? (
                          <Link href={`/test/ticket/${ticket.id}`} className="flex flex-col items-center justify-center">
                            <span>{ticketNumber}</span>
                            {percentage !== undefined && (
                              <span className="text-xs absolute bottom-1">{percentage}%</span>
                            )}
                          </Link>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Lock className="h-4 w-4 mb-1" />
                            {ticketNumber}
                          </div>
                        )}
                      </Button>
                      {!isPublic && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-2 -right-2 text-xs px-1"
                        >
                          Premium
                        </Badge>
                      )}
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
    </div>
  )
}