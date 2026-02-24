// components/premium-access-guard.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"

export function PremiumAccessGuard({ telegramLink }: { telegramLink?: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams?.get("premium") === "required") {
      setOpen(true)
    }
  }, [searchParams])

  const handleBuySubscription = () => {
    window.open(telegramLink || "https://t.me/yourusername", "_blank")
    setOpen(false)
    router.push("/dashboard")
  }

  const handleGoBack = () => {
    setOpen(false)
    router.push("/dashboard")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-[3rem] p-10 bg-white border-none shadow-2xl">
        <DialogHeader className="space-y-6">
          <div className="mx-auto w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Crown className="h-12 w-12 text-amber-500 fill-amber-500" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-3xl font-black text-center text-slate-900 italic uppercase tracking-tighter">PREMIUM OBUNA</DialogTitle>
            <p className="text-slate-500 text-center font-bold text-lg leading-relaxed">
              Bu test yoki mavzu premium foydalanuvchilar uchun mo'ljallangan. Barcha funksiyalarga kirish uchun obuna bo'ling!
            </p>
          </div>
        </DialogHeader>
        <div className="mt-10 space-y-4">
          <Button
            onClick={handleBuySubscription}
            className="w-full h-20 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-3xl shadow-2xl shadow-amber-500/20 uppercase tracking-widest text-xl italic transition-all active:scale-95"
          >
            Obunani sotib olish
          </Button>
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="w-full h-12 text-slate-400 font-bold uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl"
          >
            Orqaga
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}