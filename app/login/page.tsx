"use client"

import { useState, Suspense, useEffect } from "react"
import type { FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Eye, EyeOff, BookOpen, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslation } from "react-i18next"
import { normalizeUzbekPhone, formatUzbekPhoneDisplay } from "@/lib/phone"

function LoginForm() {
  const { t } = useTranslation()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const sessionConflict = searchParams.get("session") === "conflict"

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "")
    if (val.startsWith("998") && val.length > 3) {
      val = val.slice(3)
    }
    setPhoneNumber(formatUzbekPhoneDisplay(val))
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { cleanPhone, authEmail, isValid } = normalizeUzbekPhone(phoneNumber)
    if (!isValid) {
      toast({
        title: t("errors.general", "Xatolik"),
        description: "Telefon raqami noto'g'ri kiritildi (Masalan: 90 123 45 67)",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      })

      if (error) throw error

      const deviceId = crypto.randomUUID()
      if (typeof window !== "undefined") {
        window.localStorage.setItem("deviceId", deviceId)
        document.cookie = `device_id=${deviceId}; path=/; max-age=31536000; SameSite=Lax`
      }

      if (data.user) {
        // Check if user has a profile in public.users, if not create one (self-heal)
        const { data: profile } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle()

        if (!profile) {
          const now = new Date()
          const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
          await supabase.from("users").upsert({
            id: data.user.id,
            email: authEmail,
            phone: cleanPhone,
            role: "user",
            trial_end: trialEnd,
            subscription_end: null,
            first_name: data.user.user_metadata?.first_name || null,
            last_name: data.user.user_metadata?.last_name || null,
            active_device_id: deviceId,
            last_login_at: new Date().toISOString(),
          }, { onConflict: "id" })
        } else {
          await supabase
            .from("users")
            .update({
              active_device_id: deviceId,
              last_login_at: new Date().toISOString(),
            })
            .eq("id", data.user.id)
        }
      }

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: t("errors.general", "Xatolik"),
        description: error.message || t("auth.invalidCredentials", "Telefon raqam yoki parol noto'g'ri"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#eef6fc]">
      <div className="w-full max-w-[400px] space-y-10 relative z-10 flex flex-col items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all">
          <div className="relative w-40 h-10">
            <Image
              src="/images/logo.jpg"
              alt="Sarvar AvtoTest"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Title */}
        <div className="text-center w-full px-2">
          <h1 suppressHydrationWarning className="text-[28px] font-medium text-black">
            {t("auth.login", "Tizimga kirish")}
          </h1>
        </div>

        {/* Form elements directly on background */}
        <div className="w-full">
          {sessionConflict && (
            <Alert variant="destructive" className="mb-6 bg-red-100 border-red-200 text-red-600 rounded-lg">
              <AlertDescription className="font-medium">
                {t("auth.sessionConflict")}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label suppressHydrationWarning htmlFor="phone" className="text-black text-[15px] font-normal tracking-normal ml-0">
                {t("auth.phone", "Telefon raqam")}
              </Label>
              <div className="flex bg-white rounded-[4px] border border-slate-300 overflow-hidden shadow-sm h-[46px]">
                <div className="flex items-center gap-1.5 pl-3 pr-2 bg-white pointer-events-none border-r border-slate-200">
                  <img src="https://flagcdn.com/uz.svg" className="w-[20px] h-[14px] rounded-sm" alt="UZ" />
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex items-center pl-3 pr-1 text-black">
                  <span className="text-[15px]">+998</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="90 123 45 67"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  required
                  className="flex-1 border-0 rounded-none h-full shadow-none focus-visible:ring-0 text-[16px] text-black px-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label suppressHydrationWarning htmlFor="password" title="" className="text-black text-[15px] font-normal tracking-normal ml-0">
                {t("auth.password", "Parol")}
              </Label>
              <div className="relative group flex bg-white rounded-[4px] border border-slate-300 overflow-hidden shadow-sm h-[46px]">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder", "Parol kiriting")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex-1 border-0 rounded-none h-full shadow-none focus-visible:ring-0 text-[15px] text-[#9ca3af] pl-3 pr-12 placeholder:text-[#9ca3af]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 stroke-[2.5]" /> : <Eye className="h-5 w-5 stroke-[2.5]" />}
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <Button
                type="submit"
                className="w-full h-12 bg-[#5e53eb] hover:bg-[#5046c8] text-white font-medium rounded-[6px] shadow-sm transition-all focus-visible:ring-offset-0 focus-visible:ring-0 text-[16px]"
                disabled={loading}
              >
                {loading ? (
                  <div suppressHydrationWarning className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Kutib turing...
                  </div>
                ) : (
                  <span suppressHydrationWarning>
                    {t("auth.loginButton", "Tizimga kirish")}
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/register")}
                className="w-full h-12 bg-[#5e53eb] hover:bg-[#5046c8] text-white font-medium rounded-[6px] shadow-sm transition-all border-0 focus-visible:ring-offset-0 focus-visible:ring-0 text-[16px] hover:text-white"
              >
                <span suppressHydrationWarning>
                  {t("auth.registerButton", "Ro'yxatdan o'tish")}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
