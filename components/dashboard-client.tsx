"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Shuffle, Ticket, GraduationCap, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"
import { SubscriptionBanner } from "@/components/subscription-banner"
import { hasActiveAccess } from "@/lib/access-control"
import { useTranslation } from "react-i18next"
import type { User } from "@/lib/types"
import { useState, useEffect } from "react"
import { PremiumAccessGuard } from "@/components/premium-access-guard"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

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
    user: initialUser,
    topics,
    tickets,
    totalTestsCount,
    examStatsMap,
    topicStatsMap,
    telegramLink,
}: DashboardClientProps) {
    const { t } = useTranslation()
    const [user, setUser] = useState<User>(initialUser)
    const hasAccess = hasActiveAccess(user)
    const [isMounted, setIsMounted] = useState(false)
    const supabase = getSupabaseBrowserClient()

    useEffect(() => {
        let isMounted = true;
        if (isMounted) setIsMounted(true)

        const channel = supabase
            .channel(`user-sub-${initialUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${initialUser.id}`,
                },
                (payload) => {
                    if (isMounted) setUser(payload.new as User)
                }
            )
            .subscribe()

        return () => {
            isMounted = false
            supabase.removeChannel(channel)
        }
    }, [initialUser.id]) // Supabase is a stable singleton

    if (!isMounted) {
        return <div className="min-h-screen bg-[#e9f6ff]" />
    }

    const menuItems = [
        {
            icon: GraduationCap,
            title: t("dashboard.exams", "Imtihon topshirish"),
            label: t("dashboard.exams"),
            href: "/exams",
            color: "bg-[#E32626]", // Red
            shadowColor: "shadow-red-200",
        },
        /* {
            icon: BookOpen,
            title: t("dashboard.topicsDescription", "Mavzular bo'yicha"),
            label: t("dashboard.topics"),
            href: "/topics",
            color: "bg-[#2DA44E]", // Green
            shadowColor: "shadow-green-200",
        }, */
        {
            icon: BookOpen,
            title: "Mavzu boyicha testlar ishlab chiqilmoqda...",
            label: "Mavzu boyicha testlar",
            href: "#",
            color: "bg-[#2DA44E]/60", // Semi-transparent Green
            shadowColor: "shadow-green-100",
            isPlaceholder: true
        },
        {
            icon: Ticket,
            title: t("dashboard.ticketsDescription", "Imtihon biletlari"),
            label: t("dashboard.tickets"),
            href: "/tickets",
            color: "bg-[#F9C333]", // Yellow
            shadowColor: "shadow-yellow-200",
        },
        {
            icon: Shuffle,
            title: t("dashboard.randomTests", "Tasodifiy testlar"),
            label: t("dashboard.randomDescription", "Tasodifiy"),
            href: hasAccess ? "/test/random" : "#",
            color: "bg-[#0969DA]", // Blue
            shadowColor: "shadow-blue-200",
            requiresPremium: !hasAccess,
        },
        {
            icon: FileText,
            title: t("dashboard.viewTickets", "Barcha testlarni ko'rish"),
            label: t("dashboard.viewTickets"),
            href: "/answers",
            color: "bg-[#8250DF]", // Purple
            shadowColor: "shadow-purple-200",
        },
    ]

    return (
        <div className="min-h-screen bg-[#e9f6ff] pb-20 overflow-x-hidden">
            <PremiumAccessGuard telegramLink={telegramLink} />
            <div className="max-w-xl mx-auto px-4 relative z-10 pt-10">

                {/* Welcome Section */}
                <div className="mb-10 text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-2">
                        <span className="text-4xl">🎉</span> {t("dashboard.welcome")}
                    </h1>
                    <p className="text-slate-500 font-medium text-base">
                        {t("dashboard.chooseMode")}
                    </p>
                </div>

                {/* Main Menu Grid Style matching the image */}
                <div className="flex flex-col gap-5">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon
                        const isLocked = item.requiresPremium

                        return (
                            <Link
                                key={index}
                                href={(item as any).isPlaceholder ? "#" : (isLocked ? "?premium=required" : item.href)}
                                className={`group block ${(item as any).isPlaceholder ? "pointer-events-none opacity-80" : ""}`}
                            >
                                <div className={`
                                    relative flex items-center gap-6 p-6 rounded-[2rem] 
                                    ${item.color} shadow-lg ${item.shadowColor}
                                    transition-all duration-300 active:scale-95 
                                    ${!(item as any).isPlaceholder ? "group-hover:scale-[1.02] group-hover:brightness-105" : ""}
                                `}>
                                    {/* Icon Box */}
                                    <div className="flex items-center justify-center">
                                        <Icon className="h-10 w-10 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-white italic tracking-tight uppercase leading-tight">
                                            {item.title}
                                        </h3>
                                    </div>

                                    {/* Locked State or Arrow */}
                                    {isLocked ? (
                                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                            <span className="text-white text-lg">🔒</span>
                                        </div>
                                    ) : (item as any).isPlaceholder ? null : (
                                        <div className="h-10 w-10 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="h-8 w-8 stroke-[3]" />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
