"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { Crown } from "lucide-react"

export function LandingHero() {
    const { t } = useTranslation()
    return (
        <div className="container mx-auto px-6 py-12 md:py-20 relative">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">

                {/* Left Column Text */}
                <div className="space-y-6 text-left">
                    <h1 suppressHydrationWarning className="text-4xl md:text-5xl lg:text-[54px] font-bold text-[#2B73D6] leading-[1.2] tracking-normal mb-6">
                        {t("hero_title", "O'rganing . Tayyorlaning. Imtihondan muvaffaqiyatli o'ting !")}
                    </h1>

                    <p suppressHydrationWarning className="text-lg md:text-xl text-slate-700 max-w-lg leading-relaxed font-medium mb-8">
                        {t("hero_subtitle", "Video darslar, testlar va real imtihon tajriba – barchasi bir joyda!")}
                    </p>

                    <Button
                        asChild
                        size="lg"
                        className="h-14 px-8 bg-[#34a853] hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95 text-base"
                    >
                        <Link suppressHydrationWarning href="/login" className="flex items-center gap-2">
                            <span className="text-yellow-400 text-xl leading-none -mt-1">👑</span>
                            {t("activate_premium", "Premium obunani faollashtiring")}
                        </Link>
                    </Button>
                </div>

                {/* Right Column: Phone Mockup */}
                <div className="relative mx-auto w-[280px] sm:w-[320px] h-[580px] sm:h-[640px] bg-[#f8fafc] rounded-[2.5rem] border-[12px] sm:border-[14px] border-slate-800 shadow-2xl overflow-hidden shrink-0 mt-8 lg:mt-0">
                    {/* Notch */}
                    <div className="absolute top-0 inset-x-0 h-6 w-32 bg-slate-800 rounded-b-2xl mx-auto z-20"></div>

                    {/* Phone Content */}
                    <div className="relative h-full w-full bg-white flex flex-col z-10 pt-6">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center px-5 py-1 text-[11px] font-medium text-slate-800">
                            <span>6:33</span>
                            <div className="flex items-center gap-1.5">
                                {/* Network Bars */}
                                <div className="flex items-end gap-0.5 h-2.5">
                                    <div className="w-0.5 h-1 bg-slate-800 rounded-sm"></div>
                                    <div className="w-0.5 h-1.5 bg-slate-800 rounded-sm"></div>
                                    <div className="w-0.5 h-2 bg-slate-800 rounded-sm"></div>
                                    <div className="w-0.5 h-2.5 bg-slate-800 rounded-sm"></div>
                                </div>
                                {/* WiFi */}
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-800"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
                                {/* Battery */}
                                <div className="w-[18px] h-[10px] rounded-[3px] border border-slate-800 p-[1px] flex items-center relative">
                                    <div className="bg-slate-800 h-full w-[12px] rounded-[1px]"></div>
                                    <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[2px] h-[4px] bg-slate-800 rounded-r-sm"></div>
                                </div>
                            </div>
                        </div>

                        {/* URL Bar */}
                        <div className="flex items-center gap-2 px-3 py-1.5 mx-4 mt-2 bg-slate-50 rounded-lg text-[10px] text-slate-500">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-500 shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <span className="truncate">sarvaravtotest.uz/dashboard</span>
                            <div className="ml-auto flex gap-2">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2" /></svg>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /></svg>
                            </div>
                        </div>

                        {/* Header in App */}
                        <div className="flex justify-between items-center px-4 py-3 mt-1">
                            {/* Logo */}
                            <div className="flex items-center gap-2">
                                <div className="relative w-24 h-6">
                                    <Image
                                        src="/images/logo.jpg"
                                        alt="Sarvar AvtoTest"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Right Icons */}
                            <div className="flex items-center gap-2.5 shadow-sm px-2 py-1 bg-white rounded-full border border-slate-100">
                                <span className="text-yellow-400 text-lg leading-none">👑</span>
                                <div className="w-5 h-5 rounded-full bg-blue-50 text-[10px] flex items-center justify-center border border-slate-100">🇺🇿</div>
                                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 px-4 mt-2 flex flex-col gap-5 overflow-hidden">
                            <div className="text-center bg-[#f8fafc] py-4 rounded-2xl border border-slate-50">
                                <div className="text-2xl mb-1">🎉</div>
                                <h3 className="text-lg font-bold text-slate-800">{t("dashboard.welcome", "Xush kelibsiz!")}</h3>
                                <p className="text-[13px] text-slate-500 leading-tight mt-1 max-w-[200px] mx-auto">{t("dashboard.chooseMode", "Tezroq o'rganing va bilimlaringizni sinab ko'ring")}</p>
                            </div>

                            {/* Buttons */}
                            <div className="space-y-3">
                                <div className="w-full bg-[#34a853] text-white p-4 py-4.5 rounded-2xl flex items-center gap-3 shadow-md">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                                    <span className="font-semibold text-base tracking-wide">{t("nav.features", "Video darslar")}</span>
                                </div>

                                <div className="w-full bg-[#fbbf24] text-white p-4 py-4.5 rounded-2xl flex items-center gap-3 shadow-md">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                                    <span className="font-semibold text-base tracking-wide">{t("dashboard.tickets", "Testlar")}</span>
                                </div>

                                <div className="w-full bg-[#ef4444] text-white p-4 py-4.5 rounded-2xl flex items-center gap-3 shadow-md">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    <span className="font-semibold text-base tracking-wide">{t("dashboard.exams", "Imtihon")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Nav */}
                        <div className="absolute bottom-0 inset-x-0 h-[68px] bg-white border-t border-slate-100 flex items-center justify-around px-4 pb-2 z-20">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-600"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 font-bold text-sm -mt-2">AI</div>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-yellow-500 fill-yellow-500/20"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
