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
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-primary/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob" />
            <div className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-2000" />

            <Navbar userEmail={user.email} isAdmin={userData.role === "admin"} />

            <main className="container mx-auto px-6 py-12 max-w-4xl relative z-10">
                <div className="mb-10">
                    <Button variant="ghost" asChild className="group text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-4">
                        <Link href="/dashboard" className="inline-flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Orqaga
                        </Link>
                    </Button>
                </div>

                <div className="mb-16 text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-xl shadow-primary/5 mb-2">
                        <GraduationCap className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Imtihon rejimi</h1>
                    <p className="text-slate-400 text-lg font-medium max-w-lg mx-auto">O&apos;zingizga qulay rejimni tanlang</p>
                </div>

                <Card className="glass-dark border-white/5 rounded-[3rem] p-6 sm:p-10 shadow-3xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-20" />
                    <CardContent className="p-0 space-y-4 relative z-10">
                        {[20, 50, 100].map((count) => {
                            const percentage = examStatsMap[count]
                            return (
                                <div key={count} className="group">
                                    <Button
                                        asChild={hasAccess}
                                        className={`w-full overflow-hidden relative justify-between px-8 h-24 rounded-3xl transition-all duration-300 ${!hasAccess
                                            ? "bg-white/5 border-transparent opacity-50 cursor-not-allowed"
                                            : "bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98] shadow-lg group-hover:shadow-primary/5"
                                            }`}
                                        variant="ghost"
                                        disabled={!hasAccess}
                                    >
                                        {hasAccess ? (
                                            <Link href={`/test/exam/${count}`} className="w-full flex items-center justify-between">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="font-black text-2xl text-white tracking-tight">{count} talik imtihon</span>
                                                    <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Tasodifiy savollar asosida</span>
                                                </div>

                                                {percentage !== undefined ? (
                                                    <div className={`px-5 py-2 rounded-2xl text-lg font-black shadow-xl ${percentage >= 90 ? "bg-success/20 text-success border border-success/30" :
                                                        percentage >= 60 ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                                                            "bg-destructive/20 text-destructive border border-destructive/30"
                                                        }`}>
                                                        {percentage}%
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center transition-transform group-hover:translate-x-1">
                                                        <ArrowLeft className="h-6 w-6 text-primary rotate-180" />
                                                    </div>
                                                )}
                                            </Link>
                                        ) : (
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-slate-800/50 rounded-2xl">
                                                        <Lock className="h-6 w-6 text-slate-700" />
                                                    </div>
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="font-black text-2xl text-slate-700 tracking-tight">{count} talik imtihon</span>
                                                        <span className="text-xs text-slate-800 font-black uppercase tracking-widest">Faqat premium obunachilar uchun</span>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                                    Premium
                                                </div>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
