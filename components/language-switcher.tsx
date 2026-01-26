"use client"

import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"
import { useEffect, useState } from "react"
// Initialize i18n
import "@/lib/i18n/config"

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const languages = [
        { code: "uz", label: "O'zbekcha" },
        { code: "uz_cyrl", label: "Ўзбекча" },
    ]

    return (
        <div className="flex items-center gap-2">
            {languages.map((lang) => {
                const isActive = i18n.language === lang.code
                return (
                    <button
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`
                            h-8 px-3 rounded text-sm font-medium transition-all flex items-center gap-2
                            border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800
                            ${isActive ? "text-white" : "text-zinc-400"}
                        `}
                    >
                        {isActive && (
                            <div className="w-1 h-3 bg-[#4ade80] rounded-full" />
                        )}
                        {lang.label}
                    </button>
                )
            })}
        </div>
    )
}
