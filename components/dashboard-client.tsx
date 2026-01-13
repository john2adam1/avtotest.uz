"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Shuffle, Ticket, GraduationCap, Lock } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ClearResultsButton } from "@/components/clear-results-button"
import { SubscriptionBanner } from "@/components/subscription-banner"
import { hasActiveAccess } from "@/lib/access-control"
import { useTranslation } from "react-i18next"
import type { User } from "@/lib/types"

interface DashboardClientProps {
    user: User
    topics: any[]
    tickets: any[]
    totalTestsCount: number | null
    examStatsMap: Record<number, number>
    topicStatsMap: Record<string, number>
    telegramLink: string
}

export function DashboardClient({
    user,
    topics,
    tickets,
    totalTestsCount,
    examStatsMap,
    topicStatsMap,
    telegramLink,
}: DashboardClientProps) {
    const { t } = useTranslation()
    const hasAccess = hasActiveAccess(user)

    return (
        <>
            {/* Subscription Banner */}
            <div className="max-w-2xl mx-auto mb-10">
                <SubscriptionBanner user={user} telegramLink={telegramLink} />
            </div>

            <div className="mb-12 text-center relative">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] -z-10" />

                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    {t("dashboard.welcome")}
                </h1>
                <p className="text-lg text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
                    {t("dashboard.chooseMode")}
                </p>
                <div className="flex justify-center">
                    <ClearResultsButton />
                </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Imtihon Button Card */}
                <Card
                    className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg transition-all hover:-translate-y-1 cursor-pointer group hover:bg-white/10"
                >
                    <Link href="/exams">
                        <CardHeader className="text-center pb-2">
                            <div className="p-4 bg-primary/10 rounded-2xl w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <GraduationCap className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold font-heading text-white">
                                {t("dashboard.exams").split(" ")[0]} <span className="text-primary">{t("dashboard.exams").split(" ").slice(1).join(" ")}</span>
                                {/* Fallback if split doesn't work well for single words, just color the whole thing or specific logic if we knew the exact text. For now, let's keep it simple: Color the whole title slightly or just use the gradient text effect used in Hero. Let's try gradient on title for consistency. */}
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                                    {t("dashboard.exams")}
                                </span>
                            </CardTitle>
                            <CardDescription className="text-zinc-400 font-medium">{t("dashboard.randomQuestions")}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-6">
                            <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                <span>{t("common.start")}</span>
                            </Button>
                        </CardContent>
                    </Link>
                </Card>

                {/* Mavzu Button Card */}
                <Card
                    className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg transition-all hover:-translate-y-1 cursor-pointer group hover:bg-white/10"
                >
                    <Link href="/topics">
                        <CardHeader className="text-center pb-2">
                            <div className="p-4 bg-primary/10 rounded-2xl w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold font-heading text-white">
                                <span className="text-primary">Mavzular</span> bo'yicha
                            </CardTitle>
                            <CardDescription className="text-zinc-400 font-medium">{t("dashboard.topicsDescription")}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-6">
                            <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                <span>{t("common.start")}</span>
                            </Button>
                        </CardContent>
                    </Link>
                </Card>

                {/* Bilet Button Card */}
                <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg transition-all hover:-translate-y-1 group hover:bg-white/10">
                    <Link href="/tickets">
                        <CardHeader className="text-center pb-2">
                            <div className="p-4 bg-primary/10 rounded-2xl w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <Ticket className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold font-heading text-white">
                                Imtihon <span className="text-primary">Biletlari</span>
                            </CardTitle>
                            <CardDescription className="text-zinc-400 font-medium">{t("dashboard.ticketsDescription")}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-6">
                            <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                <span>{t("dashboard.viewTickets")}</span>
                            </Button>
                        </CardContent>
                    </Link>
                </Card>

                {/* Tasodifiy Button Card */}
                <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg transition-all hover:-translate-y-1 group hover:bg-white/10">
                    <Link href={hasAccess ? "/test/random" : "#"}>
                        <CardHeader className="text-center pb-2">
                            <div className="p-4 bg-primary/10 rounded-2xl w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <Shuffle className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold font-heading text-white">
                                <span className="text-primary">Tasodifiy</span> Test
                            </CardTitle>
                            <CardDescription className="text-zinc-400 font-medium">{t("dashboard.randomDescription")}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-6">
                            {hasAccess ? (
                                <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                    <span>{t("dashboard.startRandom")}</span>
                                </Button>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-zinc-400 py-3">
                                    <Lock className="h-4 w-4" />
                                    <span className="text-sm font-medium">{t("subscription.premium")}</span>
                                </div>
                            )}
                        </CardContent>
                    </Link>
                </Card>
            </div>
        </>
    )
}
