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

                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-primary">
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
                    className="bg-white border-zinc-200 shadow-sm cursor-pointer group"
                >
                    <Link href="/exams">
                        <CardHeader className="text-center pb-2">
                            <div className="p-4 bg-primary/10 rounded-2xl w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <GraduationCap className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold font-heading text-zinc-900">
                                {t("dashboard.exams")}
                            </CardTitle>
                            <CardDescription className="text-zinc-400 font-medium">{t("dashboard.randomQuestions")}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-6">
                            <Button className="w-full bg-primary text-white font-bold h-12 rounded-xl">
                                <span>{t("common.start")}</span>
                            </Button>
                        </CardContent>
                    </Link>
                </Card>

                {/* Mavzu Button Card */}
                <Card
                    className="bg-white border-zinc-200 shadow-sm cursor-pointer group"
                >
                    <Link href="/topics">
                        <CardHeader className="text-center pb-2">
                            <div className="p-4 bg-primary/10 rounded-2xl w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold font-heading text-zinc-900">
                                <span className="text-primary">Mavzular</span> bo'yicha
                            </CardTitle>
                            <CardDescription className="text-zinc-400 font-medium">{t("dashboard.topicsDescription")}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-6">
                            <Button className="w-full bg-primary text-white font-bold h-12 rounded-xl">
                                <span>{t("common.start")}</span>
                            </Button>
                        </CardContent>
                    </Link>
                </Card>

                {/* Bilet Button Card */}
                <Card className="bg-white border-zinc-200 shadow-sm group">
                    <Link href="/tickets">
                        <CardHeader className="text-center pb-2">
                            <div className="p-4 bg-primary/10 rounded-2xl w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <Ticket className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold font-heading text-zinc-900">
                                Imtihon <span className="text-primary">Biletlari</span>
                            </CardTitle>
                            <CardDescription className="text-zinc-400 font-medium">{t("dashboard.ticketsDescription")}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-6">
                            <Button className="w-full bg-primary text-white font-bold h-12 rounded-xl shadow-sm">
                                <span>{t("dashboard.viewTickets")}</span>
                            </Button>
                        </CardContent>
                    </Link>
                </Card>

                {/* Tasodifiy Button Card */}
                <Card className="bg-white border-zinc-200 shadow-sm group">
                    <Link href={hasAccess ? "/test/random" : "#"}>
                        <CardHeader className="text-center pb-2">
                            <div className="p-4 bg-primary/10 rounded-2xl w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <Shuffle className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold font-heading text-zinc-900">
                                <span className="text-primary">Tasodifiy</span> Test
                            </CardTitle>
                            <CardDescription className="text-zinc-400 font-medium">{t("dashboard.randomDescription")}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-6">
                            {hasAccess ? (
                                <Button className="w-full bg-primary text-white font-bold h-12 rounded-xl shadow-sm">
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
                {/* Barcha javoblar Button Card */}
                <Card className="bg-white border-zinc-200 shadow-sm group">
                    <Link href="/answers">
                        <CardHeader className="text-center pb-2">
                            <div className="p-4 bg-primary/10 rounded-2xl w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold font-heading text-zinc-900">
                                <span className="text-primary">Barcha</span> testlar javoblari
                            </CardTitle>
                            <CardDescription className="text-zinc-400 font-medium">Barcha test savollari va to'g'ri javoblarini ko'rish</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-6">
                            <Button className="w-full bg-primary text-white font-bold h-12 rounded-xl shadow-sm">
                                <span>Ko'rish</span>
                            </Button>
                        </CardContent>
                    </Link>
                </Card>

                {/* Social Media Icons */}
                <div className="pt-10 flex justify-center items-center gap-8">
                    <Link href="#" className="p-4 rounded-full bg-white border border-zinc-200 text-red-600 hover:bg-red-50 transition-all shadow-sm">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" />
                        </svg>
                    </Link>
                    <Link href="#" className="p-4 rounded-full bg-white border border-zinc-200 text-pink-600 hover:bg-pink-50 transition-all shadow-sm">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                    </Link>
                    <Link href="#" className="p-4 rounded-full bg-white border border-zinc-200 text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.462 15.598c-.145.213-.441.336-.766.336-.145 0-.294-.029-.441-.09-.328-.135-.558-.38-.646-.689-.011-.038-.857-2.903-.857-2.903s-.308.775-.436 1.054c-.995 2.146-2.212 3.12-3.87 3.12-1.071 0-2.215-.472-2.827-1.396-.464-.702-.55-1.579-.245-2.47.337-.98.988-1.583 1.832-1.696.04-.005.08-.008.121-.008.625 0 1.176.42 1.3 1.012.02.09.02.181.02.272 0 .61-.31 1.157-.8 1.455-.074.045-.152.079-.23.101.411 1.026.866 2.16 1.139 2.842l.024-.055c.298-.716 1.085-2.844 1.085-2.844s.23-.62.646-.86c.416-.24.95-.213 1.341.056.391.268.498.711.413 1.086-.011.05-.18.847-.367 1.724-.187.877-.384 1.83-.436 2.14z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </>
    )
}
