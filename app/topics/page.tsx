import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, BookOpen, ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function TopicsPage() {
    const supabase = await getSupabaseServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (!userData) redirect("/login")

    const hasAccess = hasActiveAccess(userData)

    // Fetch all topics
    const { data: topics } = await supabase
        .from("topics")
        .select("*")
        .order("created_at") // or title?

    // Fetch user stats for topics
    const { data: topicStats } = await supabase
        .from("topic_statistics")
        .select("topic_id, percentage, correct_count, wrong_count")
        .eq("user_id", user.id)

    const topicStatsMap = (topicStats || []).reduce((acc, stat) => {
        acc[stat.topic_id] = {
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
                    <div className="inline-flex items-center justify-center p-3 bg-orange-500/10 rounded-full mb-4">
                        <BookOpen className="h-8 w-8 text-orange-600" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Mavzular bo'yicha testlar</h1>
                    <p className="text-muted-foreground">Mavzuni tanlang va bilimingizni sinang</p>
                </div>

                <Card className="max-w-4xl mx-auto bg-background/60 backdrop-blur-xl border-white/10 shadow-xl">
                    <CardContent className="p-0">
                        {topics && topics.length > 0 ? (
                            <div className="divide-y divide-border/50">
                                {topics.map((topic) => {
                                    const isPublic = topic.is_public
                                    const canAccess = isPublic || hasAccess
                                    const stats = topicStatsMap[topic.id]
                                    const percentage = stats?.percentage

                                    return (
                                        <div key={topic.id} className="group flex items-center justify-between p-4 sm:p-5 hover:bg-muted/30 transition-colors">
                                            <div className="flex flex-col gap-1.5 flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className={`font-semibold text-lg ${canAccess ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {topic.title}
                                                    </h3>
                                                    {!isPublic && (
                                                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold border-green-200">
                                                            Premium
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                                                {canAccess && stats && (
                                                    <div className="flex flex-col items-end gap-1 mr-2">
                                                        <Badge className={`text-sm px-2.5 py-0.5 ${percentage >= 90 ? "bg-green-500 hover:bg-green-600" : percentage >= 60 ? "bg-yellow-500 hover:bg-yellow-600" : "bg-red-500 hover:bg-red-600"}`}>
                                                            {percentage}%
                                                        </Badge>
                                                        <div className="flex gap-1 text-[10px] sm:text-xs font-medium">
                                                            <span className="text-green-600">{stats.correct} T</span>
                                                            <span className="text-zinc-300">|</span>
                                                            <span className="text-red-500">{stats.wrong} X</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant={canAccess ? "outline" : "secondary"}
                                                    className={`min-w-[100px] h-10 ${canAccess ? "border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50" : "opacity-70"}`}
                                                    disabled={!canAccess}
                                                >
                                                    {canAccess ? (
                                                        <Link href={`/test/topic/${topic.id}`}>Boshlash</Link>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5">
                                                            <Lock className="h-3.5 w-3.5" />
                                                            <span>Premium</span>
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-12">
                                Mavzular topilmadi
                            </p>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
