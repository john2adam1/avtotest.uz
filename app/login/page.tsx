"use client"

import { useState, Suspense } from "react"
import type { FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { BookOpen } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

function LoginForm() {
  const [phone, setPhone] = useState("+998")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const sessionConflict = searchParams.get("session") === "conflict"

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: phone.replace(/\s+/g, ""),
        password,
      })

      if (error) throw error

      // Single-device login: generate deviceId and save to DB (non-admins enforced elsewhere)
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
        title: "Xatolik",
        description: error.message || "Kirishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Sarvar Avtotest</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Qaytib kelganingizdan xursandmiz</CardTitle>
            <CardDescription>Telefon raqam va parol bilan tizimga kiring</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionConflict && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>Hisobingiz boshqa qurilmada ochildi</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon raqam</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Parolingizni kiriting"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="text-right">
                  <a href="https://t.me/sarvaravtotest_admin" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                    Parolni unutdingizmi?
                  </a>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Kirilmoqda..." : "Kirish"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              Hisobingiz yo'qmi?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Ro'yxatdan o'tish
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Sarvar Avtotest</span>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">Yuklanmoqda...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
