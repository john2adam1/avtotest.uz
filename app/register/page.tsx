"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Eye, EyeOff, BookOpen, Plus } from "lucide-react"
import { registerUserWithPhone } from "@/app/auth/actions"
import { useTranslation } from "react-i18next"

export default function RegisterPage() {
  const { t } = useTranslation()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phonePrefix, setPhonePrefix] = useState("+998")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast({
        title: t("errors.general"),
        description: t("auth.passwordMinLength"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const cleanPhone = (phonePrefix + phoneNumber.replace(/[^\d+]/g, "")).replace(/[^\d+]/g, "")
    // Ensure prefix
    const fullPhone = cleanPhone.startsWith("+") ? cleanPhone : "+" + cleanPhone
    const authEmail = `${fullPhone.replace("+", "")}@gmail.com`

    try {
      const formData = new FormData()
      formData.append("phone", fullPhone)
      formData.append("password", password)
      formData.append("firstName", firstName)
      formData.append("lastName", lastName)

      const result = await registerUserWithPhone(null, formData)

      if (result.error) {
        throw new Error(result.error)
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      })

      if (signInError) throw signInError

      toast({
        title: t("auth.accountCreated"),
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: t("errors.general"),
        description: error.message || t("errors.somethingWentWrong"),
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
            {t("auth.register", "Ro'yxatdan o'tish")}
          </h1>
        </div>

        {/* Form elements directly on background */}
        <div className="w-full">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label suppressHydrationWarning htmlFor="first-name" className="text-black text-[15px] font-normal tracking-normal ml-0">
                  {t("auth.firstName", "Ism")}
                </Label>
                <div className="flex bg-white rounded-[4px] border border-slate-300 overflow-hidden shadow-sm h-[46px]">
                  <Input
                    id="first-name"
                    placeholder={t("auth.firstNamePlaceholder", "Ismingiz")}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="flex-1 border-0 rounded-none h-full shadow-none focus-visible:ring-0 text-[15px] text-black px-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label suppressHydrationWarning htmlFor="last-name" className="text-black text-[15px] font-normal tracking-normal ml-0">
                  {t("auth.lastName", "Familiya")}
                </Label>
                <div className="flex bg-white rounded-[4px] border border-slate-300 overflow-hidden shadow-sm h-[46px]">
                  <Input
                    id="last-name"
                    placeholder={t("auth.lastNamePlaceholder", "Familiyangiz")}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="flex-1 border-0 rounded-none h-full shadow-none focus-visible:ring-0 text-[15px] text-black px-3"
                  />
                </div>
              </div>
            </div>

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
                  placeholder=""
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
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
                    {t("auth.registerButton", "Ro'yxatdan o'tish")}
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full h-12 bg-[#5e53eb] hover:bg-[#5046c8] text-white font-medium rounded-[6px] shadow-sm transition-all border-0 focus-visible:ring-offset-0 focus-visible:ring-0 text-[16px] hover:text-white"
              >
                <span suppressHydrationWarning>
                  {t("auth.loginButton", "Tizimga kirish")}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
