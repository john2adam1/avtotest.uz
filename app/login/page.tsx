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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 hover:scale-105 transition-all group">
            <div className="text-primary font-black">
              <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 10V15H15V35H25V15H35V10H5Z" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col -space-y-1 text-left">
              <span className="text-2xl font-black text-foreground tracking-tighter uppercase italic">Sarvar</span>
              <span className="text-lg font-bold text-foreground tracking-tight uppercase">AvtoTest</span>
            </div>
          </Link>

          <h1 suppressHydrationWarning className="text-3xl font-black text-foreground mt-6 italic uppercase tracking-tight drop-shadow-sm">
            {t("auth.login")}
          </h1>
          <p suppressHydrationWarning className="text-muted-foreground font-medium">
            {t("auth.loginDescription")}
          </p>
        </div>

        <div className="glass-card rounded-[2.5rem] overflow-hidden hover-lift">
          <CardContent className="p-8">
            {sessionConflict && (
              <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20 text-destructive rounded-2xl">
                <AlertDescription className="font-bold">
                  {t("auth.sessionConflict")}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label suppressHydrationWarning htmlFor="phone" className="text-muted-foreground font-black uppercase text-[10px] tracking-widest ml-1">
                  {t("auth.phone")}
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-4 rounded-2xl bg-muted border border-border text-foreground min-w-[100px]">
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
                      className="rounded-2xl bg-muted border-border text-foreground placeholder:text-muted-foreground/40 h-12 focus:ring-primary focus:border-primary transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label suppressHydrationWarning htmlFor="password" title="" className="text-muted-foreground font-black uppercase text-[10px] tracking-widest ml-1">
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
                    className="rounded-2xl bg-muted border-border text-foreground placeholder:text-muted-foreground/40 h-12 focus:ring-primary focus:border-primary transition-all pr-12 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 text-lg uppercase italic tracking-widest"
                  disabled={loading}
                >
                  {loading ? (
                    <div suppressHydrationWarning className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      {t("auth.loggingIn")}
                    </div>
                  ) : (
                    <span suppressHydrationWarning className="flex items-center justify-center gap-2">
                      {t("auth.loginButton")}
                    </span>
                  )}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                    <span className="bg-white/80 backdrop-blur-sm px-4 text-muted-foreground/40">Yoki</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  asChild
                  className="w-full h-14 rounded-2xl border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:border-border transition-all font-black uppercase italic tracking-widest"
                >
                  <Link suppressHydrationWarning href="/register">
                    {t("auth.registerButton")}
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </div>

        <p className="text-center text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest">
          &copy; {new Date().getFullYear()} SarvarAvtoTest
        </p>
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
