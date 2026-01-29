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
import { useState, useEffect } from "react"

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
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <div className="min-h-screen bg-transparent" />
    }

    return (
        <>
            {/* Subscription Banner */}
            <div className="max-w-2xl mx-auto mb-8">
                <SubscriptionBanner user={user} telegramLink={telegramLink} />
            </div>

            <div className="mb-10 text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-gray-900 font-heading">
                    {t("dashboard.welcome")}
                </h1>
                <p className="text-gray-500 mb-6 max-w-lg mx-auto">
                    {t("dashboard.chooseMode")}
                </p>
                <div className="flex justify-center">
                    <ClearResultsButton />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
                {/* Imtihon Button Card */}
                <Link href="/exams">
                    <Card className="bg-white border hover:border-[#1976D2] shadow-sm transition-all cursor-pointer h-32 flex flex-col items-center justify-center gap-3">
                        <GraduationCap className="h-8 w-8 text-[#1976D2]" />
                        <span className="text-xl font-bold text-gray-800">{t("dashboard.exams")}</span>
                        <span className="text-xs text-gray-400">20, 50 yoki 100 ta savol</span>
                    </Card>
                </Link>

                {/* Mavzu Button Card */}
                <Link href="/topics">
                    <Card className="bg-white border hover:border-[#1976D2] shadow-sm transition-all cursor-pointer h-32 flex flex-col items-center justify-center gap-3">
                        <BookOpen className="h-8 w-8 text-[#1976D2]" />
                        <div className="text-center">
                            <span className="text-xl font-bold text-gray-800 block">Mavzular bo'yicha</span>
                            <span className="text-xs text-gray-400">Mavzular bo'yicha testlar</span>
                        </div>
                    </Card>
                </Link>

                {/* Bilet Button Card */}
                <Link href="/tickets">
                    <Card className="bg-white border hover:border-[#1976D2] shadow-sm transition-all cursor-pointer h-32 flex flex-col items-center justify-center gap-3">
                        <Ticket className="h-8 w-8 text-[#1976D2]" />
                        <div className="text-center">
                            <span className="text-xl font-bold text-gray-800 block">Imtihon Biletlari</span>
                            <div className="flex gap-3 justify-center text-xs font-bold mt-1">
                                <span className="text-green-600">35 To'g'ri</span>
                                <span className="text-red-500">5 Xato</span>
                            </div>
                        </div>
                    </Card>
                </Link>

                {/* Tasodifiy Button Card */}
                <Link href={hasAccess ? "/test/random" : "#"}>
                    <Card className="bg-white border hover:border-[#1976D2] shadow-sm transition-all cursor-pointer h-auto py-6 flex flex-col items-center justify-center gap-3">
                        <Shuffle className="h-8 w-8 text-[#1976D2]" />
                        <div className="text-center px-4">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-xl font-bold text-gray-800">Tasodifiy Test</span>
                                {!hasAccess && <Lock className="h-4 w-4 text-gray-400" />}
                            </div>
                            <span className="text-xs text-gray-400 block mt-1">Cheksiz savollar - xar qanday vaqtda tugatish mumkin</span>
                        </div>
                    </Card>
                </Link>

                {/* Barcha javoblar Button Card */}
                <Link href="/answers">
                    <Card className="bg-white border hover:border-[#1976D2] shadow-sm transition-all cursor-pointer h-32 flex flex-col items-center justify-center gap-3">
                        <BookOpen className="h-8 w-8 text-[#1976D2]" />
                        <div className="text-center">
                            <span className="text-xl font-bold text-gray-800 block">Barcha testlar javoblari</span>
                            <span className="text-xs text-gray-400">O'rganish rejimi</span>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* Simple Social Circles */}
            <div className="flex justify-center gap-3 pt-6 pb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            </div>
        </>
    )
}
