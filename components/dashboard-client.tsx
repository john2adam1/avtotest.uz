"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, Shuffle, Ticket, GraduationCap, FileText } from "lucide-react"
import Link from "next/link"
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
        return <div className="min-h-screen bg-background" />
    }

    const menuItems = [
        {
            icon: GraduationCap,
            title: t("dashboard.exams"),
            description: "20, 50 yoki 100 ta savol",
            href: "/exams",
            color: "bg-destructive",
            iconColor: "text-white",
        },
        {
            icon: BookOpen,
            title: "Mavzular bo'yicha",
            description: "Mavzular bo'yicha testlar",
            href: "/topics",
            color: "bg-yellow-400",
            iconColor: "text-white",
        },
        {
            icon: Ticket,
            title: "Imtihon Biletlari",
            description: "Biletlar bo'yicha testlar",
            href: "/tickets",
            color: "bg-yellow-500",
            iconColor: "text-white",
        },
        {
            icon: Shuffle,
            title: "Tasodifiy Test",
            description: "Cheksiz savollar",
            href: hasAccess ? "/test/random" : "#",
            color: "bg-primary",
            iconColor: "text-white",
            requiresPremium: !hasAccess,
        },
        {
            icon: FileText,
            title: "Barcha testlar javoblari",
            description: "O'rganish rejimi",
            href: "/answers",
            color: "bg-primary/80",
            iconColor: "text-white",
        },
    ]

    return (
        <>
            <div className="max-w-2xl mx-auto mb-8">
                <SubscriptionBanner user={user} telegramLink={telegramLink} />
            </div>

            <div className="mb-10 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900">
                    {t("dashboard.welcome")}
                </h1>
                <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                    {t("dashboard.chooseMode")}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                {menuItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <Link key={index} href={item.href}>
                            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className={`${item.color} p-3 rounded-lg`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                    </div>
                                    {item.requiresPremium && (
                                        <div className="text-amber-500 text-sm font-semibold">Premium</div>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </>
    )
}
