"use client"

import { useEffect, type ReactNode } from "react"

interface QuizProtectionProps {
    children: ReactNode
    className?: string
}

export function QuizProtection({ children, className = "" }: QuizProtectionProps) {
    useEffect(() => {
        const blockKeys = (e: KeyboardEvent) => {
            // Block Ctrl+C, Ctrl+A, Ctrl+X, Ctrl+U (view source), F12 (devtools)
            // Note: F12 and Ctrl+U are hard to block reliably in all browsers, but we can try.
            if (
                (e.ctrlKey || e.metaKey) &&
                ["c", "a", "x", "u", "s", "p"].includes(e.key.toLowerCase())
            ) {
                e.preventDefault()
            }

            // Block F12
            if (e.key === "F12") {
                e.preventDefault()
            }
        }

        document.addEventListener("keydown", blockKeys)

        return () => {
            document.removeEventListener("keydown", blockKeys)
        }
    }, [])

    return (
        <div
            className={`quiz-protect select-none ${className}`}
            onContextMenu={(e) => e.preventDefault()}
        >
            {children}
        </div>
    )
}
