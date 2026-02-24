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

    // Redirect admin to admin page instead of user topics
    if (userData.role === "admin") {
        redirect("/admin")
    }

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
                        <BookOpen className="h-10 w-10 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Mavzular bo&apos;yicha testlar</h1>
                    <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto">Mavzuni tanlang va bilimingizni sinang</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-blue-500/5 overflow-hidden p-3 md:p-6">
                    {topics && topics.length > 0 ? (
                        <div className="space-y-3">
                            {topics.map((topic) => {
                                const isPublic = topic.is_public
                                const canAccess = isPublic || hasAccess
                                const stats = topicStatsMap[topic.id]
                                const percentage = stats?.percentage

                                return (
                                    <div key={topic.id} className="group relative">
                                        <div className="flex items-center justify-between p-6 rounded-3xl transition-all duration-300 hover:bg-blue-50/50 border border-slate-50 hover:border-blue-100 overflow-hidden">
                                            <div className="flex flex-col gap-2 flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className={`font-black text-xl transition-colors ${canAccess ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {topic.title}
                                                    </h3>
                                                    {!isPublic && (
                                                        <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                                                            Premium
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 shrink-0">
                                                {canAccess && stats && (
                                                    <div className="hidden sm:flex flex-col items-end gap-1.5 mr-2">
                                                        <div className={`px-4 py-1 rounded-full text-sm font-black shadow-sm ${percentage >= 90 ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                                                            percentage >= 60 ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                                                                "bg-red-500/10 text-red-600 border border-red-500/20"
                                                            }`}>
                                                            {percentage}%
                                                        </div>
                                                        <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            <span className="text-green-600">{stats.correct} T</span>
                                                            <span className="opacity-20">|</span>
                                                            <span className="text-red-600">{stats.wrong} X</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <Button
                                                    asChild
                                                    className={`h-12 px-8 rounded-2xl font-black text-base transition-all ${canAccess
                                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
                                                        : "bg-slate-100 text-slate-400 cursor-not-allowed border-none shadow-none"
                                                        }`}
                                                    disabled={!canAccess}
                                                >
                                                    {canAccess ? (
                                                        <Link href={`/test/topic/${topic.id}`}>Boshlash</Link>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Lock className="h-4 w-4" />
                                                            <span>Premium</span>
                                                        </div>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 px-6 space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-10 w-10 text-slate-300" />
                            </div>
                            <p className="text-slate-400 text-xl font-bold italic">
                                Mavzular topilmadi
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
