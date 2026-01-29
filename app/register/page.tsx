"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { BookOpen } from "lucide-react"
import { registerUserWithPhone } from "@/app/auth/actions"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("+998")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast({
        title: "Xatolik",
        description: "Parol kamida 6 belgidan iborat bo'lishi kerak",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Server-side registration (Admin creates verified user)
      const formData = new FormData()
      formData.append("phone", phone)
      formData.append("password", password)
      formData.append("firstName", firstName)
      formData.append("lastName", lastName)

      const result = await registerUserWithPhone(null, formData)

      if (result.error) {
        throw new Error(result.error)
      }

      // 2. Client-side login immediately after creation
      const { error: signInError } = await supabase.auth.signInWithPassword({
        phone: phone.replace(/\s+/g, ""),
        password,
      })

      if (signInError) throw signInError

      toast({
        title: "Muvaffaqiyatli!",
        description: "Hisob muvaffaqiyatli yaratildi.",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "Hisob yaratishda xatolik yuz berdi",
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
            <CardTitle>Ro'yxatdan o'tish</CardTitle>
            <CardDescription>Telefon raqamingiz orqali yangi hisob yarating</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">Ism</Label>
                <Input
                  id="first-name"
                  placeholder="Ismingiz"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last-name">Familiya</Label>
                <Input
                  id="last-name"
                  placeholder="Familiyangiz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

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
                  placeholder="Kamida 6 ta belgi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Hisob yaratilmoqda..." : "Hisob yaratish"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              Allaqachon hisobingiz bormi?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Kirish
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
