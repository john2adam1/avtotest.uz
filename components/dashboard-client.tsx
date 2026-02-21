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
        setIsMounted(true)

        // Set up real-time subscription to listen for user updates
        const channel = supabase
            .channel('user-subscription-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${initialUser.id}`,
                },
                (payload) => {
                    console.log('User subscription updated:', payload)
                    setUser(payload.new as User)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [initialUser.id, supabase])

    if (!isMounted) {
        return <div className="min-h-screen bg-slate-950" />
    }

    const menuItems = [
        {
            icon: GraduationCap,
            title: t("dashboard.exams"),
            description: "20, 50 yoki 100 ta savol",
            href: "/exams",
            color: "bg-rose-500",
            glowColor: "shadow-rose-500/20",
        },
        {
            icon: BookOpen,
            title: "Mavzular bo'yicha",
            description: "Mavzular bo'yicha testlar",
            href: "/topics",
            color: "bg-amber-400",
            glowColor: "shadow-amber-400/20",
        },
        {
            icon: Ticket,
            title: "Imtihon Biletlari",
            description: "Biletlar bo'yicha testlar",
            href: "/tickets",
            color: "bg-sky-500",
            glowColor: "shadow-sky-500/20",
        },
        {
            icon: Shuffle,
            title: "Tasodifiy Test",
            description: "Cheksiz savollar",
            href: hasAccess ? "/test/random" : "#",
            color: "bg-primary",
            glowColor: "shadow-primary/20",
            requiresPremium: !hasAccess,
        },
        {
            icon: FileText,
            title: "Barcha testlar javoblari",
            description: "O'rganish rejimi",
            href: "/answers",
            color: "bg-emerald-500",
            glowColor: "shadow-emerald-500/20",
        },
    ]

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-primary/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob" />
            <div className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-2000" />

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="mb-12">
                    <SubscriptionBanner user={user} telegramLink={telegramLink} />
                </div>

                <div className="mb-12 text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black mb-3 text-white tracking-tight">
                        {t("dashboard.welcome")}
                    </h1>
                    <p className="text-slate-400 text-lg font-medium max-w-lg mx-auto leading-relaxed">
                        {t("dashboard.chooseMode")}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon
                        return (
                            <Link key={index} href={item.href} className="group">
                                <Card className="p-6 transition-all duration-500 glass-dark border-white/5 rounded-3xl group-hover:border-white/10 group-hover:scale-[1.02] active:scale-[0.98] group-hover:bg-white/10 overflow-hidden relative border-none">
                                    {/* Hover Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                    <div className="flex items-center gap-6 relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                                        <div className={`${item.color} p-4 rounded-2xl shadow-xl ${item.glowColor} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <h3 className="text-xl font-extrabold text-white group-hover:text-primary transition-colors">{item.title}</h3>
                                            <p className="text-base text-slate-500 font-bold">{item.description}</p>
                                        </div>
                                        {item.requiresPremium ? (
                                            <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-black uppercase tracking-widest shadow-lg shadow-amber-500/5 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                                Premium
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-primary text-2xl font-black">→</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
