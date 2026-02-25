"use client"

import { redirect, useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lock, BookOpen, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import type { User } from "@/lib/types"

export default function TopicsPage() {
    const { t } = useTranslation()
    const router = useRouter()
    const supabase = getSupabaseBrowserClient()

    const [user, setUser] = useState<User | null>(null)
    const [topics, setTopics] = useState<any[]>([])
    const [topicStatsMap, setTopicStatsMap] = useState<Record<string, any>>({})
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

            // Fetch topics and stats in parallel
            const [topicsRes, statsRes] = await Promise.all([
                supabase.from("topics").select("*").order("created_at"),
                supabase.from("topic_statistics").select("topic_id, percentage, correct_count, wrong_count").eq("user_id", authUser.id)
            ])

            setTopics(topicsRes.data || [])

            const statsMap = (statsRes.data || []).reduce((acc, stat) => {
                acc[stat.topic_id] = {
                    percentage: stat.percentage,
                    correct: stat.correct_count,
                    wrong: stat.wrong_count
                }
                return acc
            }, {} as Record<string, any>)

            setTopicStatsMap(statsMap)
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
        <div className="min-h-screen relative overflow-hidden">
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
                    <div className="inline-flex items-center justify-center p-5 bg-white/80 backdrop-blur-sm rounded-3xl border border-white shadow-xl shadow-primary/5 mb-2">
                        <BookOpen className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight italic uppercase drop-shadow-sm">{t("dashboard.topicsDescription", "Mavzular bo'yicha testlar")}</h1>
                    <p className="text-muted-foreground text-lg font-medium max-w-lg mx-auto">{t("dashboard.chooseMode")}</p>
                </div>

                <div className="glass-card rounded-[2.5rem] overflow-hidden p-3 md:p-6 mb-8 hover-lift">
                    {topics && topics.length > 0 ? (
                        <div className="space-y-3">
                            {topics.map((topic) => {
                                const isPublic = topic.is_public
                                const canAccess = isPublic || hasAccess
                                const stats = topicStatsMap[topic.id]
                                const percentage = stats?.percentage

                                return (
                                    <div key={topic.id} className="group relative">
                                        <div className={`flex items-center justify-between p-6 rounded-3xl transition-all duration-300 border border-transparent 
                                            ${canAccess ? 'hover:bg-primary/5 hover:border-primary/10 hover-lift' : 'opacity-80'}`}>
                                            <div className="flex flex-col gap-2 flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className={`font-black text-xl transition-colors ${canAccess ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                                                        {topic.title}
                                                    </h3>
                                                    {!isPublic && (
                                                        <div className="px-3 py-1 rounded-full bg-premium-gold/10 border border-premium-gold/20 text-premium-gold text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                            {t("subscription.premium", "Premium")}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 shrink-0">
                                                {canAccess && stats && (
                                                    <div className="hidden sm:flex flex-col items-end gap-1.5 mr-2">
                                                        <div className={`px-4 py-1 rounded-full text-sm font-black shadow-sm ${percentage >= 90 ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                                                            percentage >= 60 ? "bg-premium-gold/10 text-premium-gold border border-premium-gold/20" :
                                                                "bg-red-500/10 text-red-600 border border-red-500/20"
                                                            }`}>
                                                            {percentage}%
                                                        </div>
                                                        <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                            <span className="text-green-600">{stats.correct} {t("test.correct", "T")}</span>
                                                            <span className="opacity-20">|</span>
                                                            <span className="text-red-600">{stats.wrong} {t("test.wrong", "X")}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <Button
                                                    asChild
                                                    className={`h-12 px-8 rounded-2xl font-black text-base transition-all ${canAccess
                                                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                                                        : "bg-muted text-muted-foreground/40 cursor-not-allowed border-none shadow-none"
                                                        }`}
                                                    disabled={!canAccess}
                                                >
                                                    {canAccess ? (
                                                        <Link href={`/test/topic/${topic.id}`}>{t("dashboard.startTest", "Boshlash")}</Link>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <Lock className="h-4 w-4" />
                                                            <span>{t("subscription.premium", "Premium")}</span>
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
                            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <p className="text-muted-foreground/50 text-xl font-bold italic">
                                {t("dashboard.noTopics", "Mavzular topilmadi")}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
