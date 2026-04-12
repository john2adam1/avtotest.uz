"use client"

import { redirect, useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { hasActiveAccess } from "@/lib/access-control"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Lock, ArrowLeft, ChevronLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import type { User } from "@/lib/types"
import { PremiumAccessGuard } from "@/components/premium-access-guard"

export default function ExamsPage() {
    const { t } = useTranslation()
    const router = useRouter()
    const supabase = getSupabaseBrowserClient()

    const [user, setUser] = useState<User | null>(null)
    const [examStatsMap, setExamStatsMap] = useState<Record<number, number>>({})
    const [telegramLink, setTelegramLink] = useState("https://t.me/yourusername")
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

            const { data: examStats } = await supabase
                .from("exam_statistics")
                .select("exam_type, percentage")
                .eq("user_id", authUser.id)

            const statsMap = (examStats || []).reduce((acc, stat) => {
                acc[stat.exam_type] = stat.percentage
                return acc
            }, {} as Record<number, number>)

            const { data: contactData } = await supabase.from("site_content").select("content").eq("type", "contact").maybeSingle()
            if (contactData?.content?.telegram_link) {
                setTelegramLink(contactData.content.telegram_link)
            }

            setExamStatsMap(statsMap)
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
        <div className="min-h-screen bg-[#e9f6ff] relative overflow-hidden">
            <PremiumAccessGuard telegramLink={telegramLink} />
            <Navbar userEmail={user.email} isAdmin={user.role === "admin"} />

            <main className="container mx-auto px-6 py-12 max-w-4xl relative z-10">
                <div className="mb-10">
                    <Button asChild className="px-5 h-9 bg-[#1875d1] hover:bg-[#1565c0] text-white rounded font-normal text-sm gap-1.5 shadow-sm transition-all active:scale-95">
                        <Link href="/dashboard" className="inline-flex items-center gap-1.5">
                            <ChevronLeft className="h-4 w-4" />
                            Ortga
                        </Link>
                    </Button>
                </div>

                <div className="mb-12 text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-5 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-500/5 mb-2">
                        <GraduationCap className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">{t("dashboard.exams", "Imtihon topshirish")}</h1>
                    <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto">{t("dashboard.randomQuestions")}</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-[3rem] p-6 sm:p-10 shadow-xl shadow-blue-500/5 overflow-hidden relative">
                    <div className="space-y-4 relative z-10">
                        {[20, 50, 100].map((count) => {
                            const percentage = examStatsMap[count]
                            const isLocked = !hasAccess

                            return (
                                <div key={count} className="group">
                                    <Button
                                        asChild
                                        className={`
                                            w-full overflow-hidden relative justify-between px-8 h-28 rounded-[2rem] 
                                            transition-all duration-300 border-2
                                            ${isLocked
                                                ? "bg-slate-50 border-slate-200 cursor-pointer hover:border-amber-200"
                                                : "bg-[#E32626] border-[#E32626] text-white shadow-lg shadow-red-100 hover:scale-[1.02] active:scale-[0.98]"
                                            }
                                        `}
                                        variant="ghost"
                                    >
                                        <Link href={isLocked ? "?premium=required" : `/test/exam/${count}`} className="w-full flex items-center justify-between">
                                            {!isLocked ? (
                                                <>
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="font-black text-3xl italic tracking-tight uppercase">{count} {t("test.of", "ta")} {t("test.question", "savol")}</span>
                                                        <span className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em]">{t("dashboard.randomDescription")}</span>
                                                    </div>

                                                    {percentage !== undefined ? (
                                                        <div className={`px-5 py-2 rounded-2xl text-lg font-black shadow-inner bg-black/10 text-white`}>
                                                            {percentage}%
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-2">
                                                            <ArrowLeft className="h-8 w-8 text-white rotate-180" />
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-4 bg-slate-200/80 rounded-2xl text-slate-500">
                                                            <Lock className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className="font-black text-2xl text-slate-500 italic tracking-tight uppercase">{count} {t("test.of", "ta")} {t("test.question", "savol")}</span>
                                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t("dashboard.premiumRequired", "Premium obuna uchun")}</span>
                                                        </div>
                                                    </div>
                                                    <div className="px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest group-hover:bg-amber-500/20 transition-colors">
                                                        {t("subscription.premium", "Premium")}
                                                    </div>
                                                </>
                                            )}
                                        </Link>
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>
        </div >
    )
}
