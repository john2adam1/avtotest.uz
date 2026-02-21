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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-3 hover:scale-105 transition-transform duration-300">
            <div className="p-2 bg-primary/20 rounded-xl backdrop-blur-md border border-primary/30">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold tracking-tight text-white leading-tight">Tezkor</div>
              <div className="text-sm font-medium text-slate-400">Avtotest Platformasi</div>
            </div>
          </Link>

          <h1 className="text-2xl font-bold text-white mt-6">
            {t("auth.login")}
          </h1>
          <p className="text-slate-400 text-sm">
            Ilovaga kirish uchun ma'lumotlaringizni kiriting
          </p>
        </div>

        <div className="glass-dark border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
          <CardContent className="p-8">
            {sessionConflict && (
              <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20 text-red-400">
                <AlertDescription>
                  {t("auth.sessionConflict")}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300 ml-1">
                  {t("auth.phone")}
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-4 rounded-2xl bg-white/5 border border-white/10 text-white min-w-[100px] backdrop-blur-sm">
                    <img src="https://flagcdn.com/uz.svg" className="w-5 h-3 rounded-sm shadow-sm" alt="UZ" />
                    <span className="text-sm font-bold">+998</span>
                  </div>
                  <div className="relative flex-1">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="90 123 45 67"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11 focus:ring-primary/50 focus:border-primary transition-all pr-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="" className="text-slate-300 ml-1">
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
                    className="rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-11 focus:ring-primary/50 focus:border-primary transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("auth.loggingIn")}
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Plus className="h-5 w-5" />
                      {t("auth.loginButton")}
                    </span>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0f172a] px-2 text-slate-500">Yoki</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  asChild
                  className="w-full h-12 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <Link href="/register">
                    {t("auth.registerButton")}
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </div>

        <p className="text-center text-slate-500 text-xs">
          &copy; {new Date().getFullYear()} Tezkor Avtotest. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
