"use client"

import { useState, Suspense, useEffect } from "react"
import type { FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Eye, EyeOff, BookOpen, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslation } from "react-i18next"

function LoginForm() {
  const { t } = useTranslation()
  const [phonePrefix, setPhonePrefix] = useState("+998")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const sessionConflict = searchParams.get("session") === "conflict"

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const cleanPhone = (phonePrefix + phoneNumber.replace(/[^\d+]/g, "")).replace(/[^\d+]/g, "")
    // Ensure prefix
    const fullPhone = cleanPhone.startsWith("+") ? cleanPhone : "+" + cleanPhone
    const authEmail = `${fullPhone.replace("+", "")}@gmail.com`

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
        await supabase
          .from("users")
          .update({
            active_device_id: deviceId,
            last_login_at: new Date().toISOString(),
          })
          .eq("id", data.user.id)
      }

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: t("errors.general"),
        description: error.message || t("auth.invalidCredentials"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#e9f6ff]">
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 hover:scale-105 transition-all group">
            <div className="text-blue-700 font-black">
              <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 10V15H15V35H25V15H35V10H5Z" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col -space-y-1 text-left">
              <span className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Tezkor</span>
              <span className="text-lg font-bold text-slate-800 tracking-tight uppercase">Avtotest</span>
            </div>
          </Link>

          <h1 className="text-3xl font-black text-slate-900 mt-6 italic uppercase tracking-tight">
            {t("auth.login")}
          </h1>
          <p className="text-slate-500 font-medium">
            Ilovaga kirish uchun ma'lumotlaringizni kiriting
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl shadow-blue-500/5">
          <CardContent className="p-8">
            {sessionConflict && (
              <Alert variant="destructive" className="mb-6 bg-red-50 border-red-100 text-red-600 rounded-2xl">
                <AlertDescription className="font-bold">
                  {t("auth.sessionConflict")}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-500 font-black uppercase text-[10px] tracking-widest ml-1">
                  {t("auth.phone")}
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 min-w-[100px]">
                    <img src="https://flagcdn.com/uz.svg" className="w-5 h-3 rounded-sm shadow-sm" alt="UZ" />
                    <span className="text-sm font-black">+998</span>
                  </div>
                  <div className="relative flex-1">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="90 123 45 67"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="rounded-2xl bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 h-12 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="" className="text-slate-500 font-black uppercase text-[10px] tracking-widest ml-1">
                  {t("auth.password")}
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-2xl bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300 h-12 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 text-lg uppercase italic tracking-widest"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("auth.loggingIn")}
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {t("auth.loginButton")}
                    </span>
                  )}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                    <span className="bg-white px-4 text-slate-300">Yoki</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  asChild
                  className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-200 transition-all font-black uppercase italic tracking-widest"
                >
                  <Link href="/register">
                    {t("auth.registerButton")}
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </div>

        <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Tezkor Avtotest
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#e9f6ff]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
