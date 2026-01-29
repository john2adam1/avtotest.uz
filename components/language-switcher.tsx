"use client"

import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import "@/lib/i18n/config"

export function LanguageSwitcher() {
    const { i18n } = useTranslation()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const languages = [
        { code: "uz", label: "O'z" },
        { code: "uz_cyrl", label: "Ўз" },
    ]

    return (
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {languages.map((lang) => {
                const isActive = i18n.language === lang.code
                return (
                    <button
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                        className={`
                            h-8 px-3 rounded-md text-sm font-medium transition-all
                            ${isActive 
                                ? "bg-sky-500 text-white shadow-sm" 
                                : "text-gray-600 hover:text-gray-900"
                            }
                        `}
                    >
                        {lang.label}
                    </button>
                )
            })}
        </div>
    )
}
