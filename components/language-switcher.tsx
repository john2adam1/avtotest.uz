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
        { code: "uz", label: "O'zbek (Lotin)" },
        { code: "uz_cyrl", label: "Ўзбек (Кирилл)" },
        { code: "ru", label: "Русский" },
    ]

    const getFlag = (langCode: string) => {
        if (!langCode) return "🇺🇿" // Default
        if (langCode.startsWith("uz")) return "🇺🇿"
        if (langCode === "ru") return "🇷🇺"
        return "🇺🇿"
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 px-0 rounded-full hover:bg-white/5">
                    <span className="text-xl" role="img" aria-label="Current language">
                        {getFlag(i18n.language)}
                    </span>
                    <span className="sr-only">Change language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-white">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`focus:bg-white/5 focus:text-white cursor-pointer gap-3 text-base font-medium py-2 ${i18n.language === lang.code ? "bg-white/10" : ""
                            }`}
                    >
                        <span className="text-xl">{getFlag(lang.code)}</span>
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
