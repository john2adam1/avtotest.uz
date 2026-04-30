"use client"

import "@/lib/i18n/config"
import i18n from "@/lib/i18n/config"
import { useEffect } from "react"

export function I18nProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // After mount, restore user's preferred language from localStorage
        // (i18next-browser-languagedetector's default cache key is 'i18nextLng')
        const saved = localStorage.getItem("i18nextLng")
        if (saved && saved !== i18n.language && ["uz", "uz_cyrl"].includes(saved)) {
            i18n.changeLanguage(saved)
        }
    }, [])

    return <>{children}</>
}

