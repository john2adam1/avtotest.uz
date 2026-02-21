"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus } from "lucide-react"
import type { UserSettings } from "@/lib/types"

interface SettingsFormProps {
  initialSettings: UserSettings | null
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [questionFontSize, setQuestionFontSize] = useState(initialSettings?.question_font_size || 16)
  const [answerFontSize, setAnswerFontSize] = useState(initialSettings?.answer_font_size || 14)
  const [language, setLanguage] = useState<"uz-lat" | "uz-cyr" | "ru">(
    (initialSettings?.language as "uz-lat" | "uz-cyr" | "ru") || "uz-lat"
  )
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const adjustFontSize = (type: "question" | "answer", delta: number) => {
    if (type === "question") {
      const newSize = Math.max(12, Math.min(24, questionFontSize + delta))
      setQuestionFontSize(newSize)
    } else {
      const newSize = Math.max(12, Math.min(24, answerFontSize + delta))
      setAnswerFontSize(newSize)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (initialSettings) {
        const { error } = await supabase
          .from("user_settings")
          .update({
            question_font_size: questionFontSize,
            answer_font_size: answerFontSize,
            language,
          })
          .eq("id", initialSettings.id)

        if (error) throw error
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error("User not found")

        const { error } = await supabase.from("user_settings").insert({
          user_id: user.id,
          question_font_size: questionFontSize,
          answer_font_size: answerFontSize,
          language,
        })

        if (error) throw error
      }

      toast({
        title: "Muvaffaqiyatli",
        description: "Sozlamalar saqlandi",
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message || "Sozlamalarni saqlashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shrift o'lchami</CardTitle>
        <CardDescription>Savol va javoblar uchun shrift o'lchamini sozlang</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Font Size */}
        <div className="space-y-2">
          <Label>Savol o'lchami</Label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustFontSize("question", -2)}
              disabled={questionFontSize <= 12}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-semibold" style={{ fontSize: `${questionFontSize}px` }}>
                Aa
              </span>
              <p className="text-sm text-muted-foreground mt-1">{questionFontSize}px</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustFontSize("question", 2)}
              disabled={questionFontSize >= 24}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Answer Font Size */}
        <div className="space-y-2">
          <Label>Javob o'lchami</Label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustFontSize("answer", -2)}
              disabled={answerFontSize <= 12}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <span className="text-xl font-semibold" style={{ fontSize: `${answerFontSize}px` }}>
                Aa
              </span>
              <p className="text-sm text-muted-foreground mt-1">{answerFontSize}px</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustFontSize("answer", 2)}
              disabled={answerFontSize >= 24}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <Label>Til</Label>
          <Select value={language} onValueChange={(value) => setLanguage(value as "uz-lat" | "uz-cyr" | "ru")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uz-lat">O'zbek (Lotin)</SelectItem>
              <SelectItem value="uz-cyr">O'zbek (Kirill)</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} className="w-full bg-primary hover:opacity-90 text-white" disabled={saving}>
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </CardContent>
    </Card>
  )
}
