import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface TimerProps {
    durationSeconds: number
    onTimeUp?: () => void
}

export function Timer({ durationSeconds, onTimeUp }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(durationSeconds)

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp?.()
            return
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft, onTimeUp])

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60)
        const sec = seconds % 60
        return `${min}:${sec.toString().padStart(2, "0")}`
    }

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xl border ${timeLeft < 60 ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-primary border-zinc-200"
            }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
        </div>
    )
}
