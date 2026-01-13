import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, GraduationCap, ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ExamsPage() {
    const supabase = await getSupabaseServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (!userData) redirect("/login")

    const hasAccess = hasActiveAccess(userData)

    // Fetch counts of total tickets? Or just check if tests exist
    const { count } = await supabase.from("tests").select("*", { count: "exact", head: true })

    // Fetch exam stats
    const { data: examStats } = await supabase
        .from("exam_statistics")
        .select("exam_type, percentage")
        .eq("user_id", user.id)

    const examStatsMap = (examStats || []).reduce((acc, stat) => {
        acc[stat.exam_type] = stat.percentage
        return acc
    }, {} as Record<number, number>)

    return (
        <div className="min-h-screen bg-background">
            <Navbar userEmail={user.email} isAdmin={userData.role === "admin"} />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto mb-8">
                    <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            Orqaga
                        </Link>
                    </Button>
                </div>

                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Imtihon rejimi</h1>
                    <p className="text-muted-foreground">O'zingizga qulay rejimni tanlang</p>
                </div>

                <Card className="max-w-2xl mx-auto bg-background/60 backdrop-blur-xl border-white/10 shadow-xl">
                    <CardContent className="p-6 space-y-4">
                        {[20, 50, 100].map((count) => {
                            const percentage = examStatsMap[count]
                            return (
                                <Button
                                    key={count}
                                    asChild
                                    className={`w-full relative justify-between px-6 h-16 text-lg ${!hasAccess
                                        ? "opacity-80"
                                        : "bg-card hover:bg-primary/5 border border-primary/10 hover:border-primary/30 text-foreground shadow-sm"
                                        }`}
                                    variant={!hasAccess ? "secondary" : "ghost"}
                                    disabled={!hasAccess || (count > (count || 0))} // Logical check, though count is always present
                                >
                                    {hasAccess ? (
                                        <Link href={`/test/exam/${count}`} className="w-full flex items-center justify-between">
                                            <div className="flex flex-col items-start gap-0.5">
                                                <span className="font-bold text-xl">{count} talik imtihon</span>
                                                <span className="text-xs text-muted-foreground font-normal">Tasodifiy savollar asosida</span>
                                            </div>

                                            {percentage !== undefined && (
                                                <Badge className={`text-base px-3 py-1 ${percentage >= 90 ? "bg-green-500 hover:bg-green-600" : percentage >= 60 ? "bg-yellow-500 hover:bg-yellow-600" : "bg-red-500 hover:bg-red-600"}`}>
                                                    {percentage}%
                                                </Badge>
                                            )}
                                        </Link>
                                    ) : (
                                        <div className="flex items-center justify-between w-full text-muted-foreground">
                                            <div className="flex items-center gap-3">
                                                <Lock className="h-5 w-5" />
                                                <span className="font-bold text-xl">{count} talik imtihon</span>
                                            </div>
                                            <Badge variant="outline" className="border-green-500/20 text-green-600 bg-green-50 dark:bg-green-900/20 font-bold px-3 py-1">Premium</Badge>
                                        </div>
                                    )}
                                </Button>
                            )
                        })}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
