// components/admin/tests-management.tsx
"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit2, Plus, X } from "lucide-react"
import type { Test, Ticket } from "@/lib/types"

interface TestWithRelation extends Test {
  ticket_title?: string
}

export function TestsManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [tests, setTests] = useState<TestWithRelation[]>([])
  const [selectedTicket, setSelectedTicket] = useState("")
  const [category, setCategory] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [question, setQuestion] = useState("")
  const [questionCyrl, setQuestionCyrl] = useState("")
  const [answers, setAnswers] = useState(["", ""])
  const [answersCyrl, setAnswersCyrl] = useState(["", ""])
  const [correctAnswer, setCorrectAnswer] = useState("0")
  const [timeLimit, setTimeLimit] = useState("300")
  const [explanationTitle, setExplanationTitle] = useState("")
  const [explanationTitleCyrl, setExplanationTitleCyrl] = useState("")
  const [explanationText, setExplanationText] = useState("")
  const [explanationTextCyrl, setExplanationTextCyrl] = useState("")
  const [audioFileCyrl, setAudioFileCyrl] = useState<File | null>(null)
  const [audioUrlCyrl, setAudioUrlCyrl] = useState("")
  const [audioPreviewCyrl, setAudioPreviewCyrl] = useState<string | null>(null)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchTickets()
    fetchTests()
  }, [])

  const fetchTickets = async () => {
    const { data } = await supabase.from("tickets").select("*").order("title")
    if (data) setTickets(data)
  }

  const fetchTests = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("tests")
      .select(`*`)
      .order("created_at", { ascending: false })

    if (data) {
      setTests(data)
    }
    setLoading(false)
  }

  const resetForm = () => {
    setSelectedTicket("")
    setCategory("")
    setImageFile(null)
    setAudioFile(null)
    setImageUrl("")
    setAudioUrl("")
    setImagePreview(null)
    setAudioPreview(null)
    setQuestion("")
    setQuestionCyrl("")
    setAnswers(["", ""])
    setAnswersCyrl(["", ""])
    setCorrectAnswer("0")
    setTimeLimit("300")
    setExplanationTitle("")
    setExplanationTitleCyrl("")
    setExplanationText("")
    setExplanationTextCyrl("")
    setAudioFileCyrl(null)
    setAudioUrlCyrl("")
    setAudioPreviewCyrl(null)
    setEditingTest(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Rasm faylini tanlang",
          variant: "destructive",
        })
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Error",
          description: "Audio faylini tanlang",
          variant: "destructive",
        })
        return
      }
      setAudioFile(file)
      setAudioPreview(URL.createObjectURL(file))
    }
  }

  const handleAudioCyrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Error",
          description: "Audio faylini tanlang",
          variant: "destructive",
        })
        return
      }
      setAudioFileCyrl(file)
      setAudioPreviewCyrl(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl || null

    setUploadingImage(true)
    try {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `test-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("test-images").upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("test-images").getPublicUrl(filePath)

      setUploadingImage(false)
      return publicUrl
    } catch (error: any) {
      setUploadingImage(false)
      toast({
        title: "Error",
        description: error.message || "Rasm faylini yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
      return null
    }
  }

  const uploadAudio = async (): Promise<string | null> => {
    if (!audioFile) return audioUrl || null

    setUploadingAudio(true)
    try {
      const fileExt = audioFile.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `test-audio/${fileName}`

      const { error: uploadError } = await supabase.storage.from("test-audio").upload(filePath, audioFile, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("test-audio").getPublicUrl(filePath)

      setUploadingAudio(false)
      return publicUrl
    } catch (error: any) {
      setUploadingAudio(false)
      toast({
        title: "Error",
        description: error.message || "Audio faylini yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
      return null
    }
  }

  const uploadAudioCyrl = async (): Promise<string | null> => {
    if (!audioFileCyrl) return audioUrlCyrl || null

    setUploadingAudio(true)
    try {
      const fileExt = audioFileCyrl.name.split(".").pop()
      const fileName = `${Date.now()}-cyrl-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `test-audio/${fileName}`

      const { error: uploadError } = await supabase.storage.from("test-audio").upload(filePath, audioFileCyrl, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("test-audio").getPublicUrl(filePath)

      setUploadingAudio(false)
      return publicUrl
    } catch (error: any) {
      setUploadingAudio(false)
      toast({
        title: "Error",
        description: error.message || "Audio faylini (Kirill) yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
      return null
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validation
    if (!selectedTicket && !editingTest) {
      toast({
        title: "Error",
        description: "Biletni tanlang",
        variant: "destructive",
      })
      return
    }

    if (!category) {
      toast({
        title: "Error",
        description: "Kategoriyani kiriting",
        variant: "destructive",
      })
      return
    }

    if ((!imageUrl && !imageFile) || !question) {
      toast({
        title: "Error",
        description: "Barcha majburiy maydonlarni to'ldiring",
        variant: "destructive",
      })
      return
    }

    if (answers.some((a) => !a.trim())) {
      toast({
        title: "Error",
        description: `Barcha ${answers.length} javoblarni kiriting`,
        variant: "destructive",
      })
      return
    }

    let finalImageUrl = imageUrl
    let finalAudioUrl = audioUrl
    let finalAudioUrlCyrl = audioUrlCyrl

    if (imageFile) {
      const uploadedImageUrl = await uploadImage()
      if (!uploadedImageUrl) return
      finalImageUrl = uploadedImageUrl
    }

    if (audioFile) {
      const uploadedAudioUrl = await uploadAudio()
      if (uploadedAudioUrl) {
        finalAudioUrl = uploadedAudioUrl
      }
    }

    if (audioFileCyrl) {
      const uploadedAudioUrlCyrl = await uploadAudioCyrl()
      if (uploadedAudioUrlCyrl) {
        finalAudioUrlCyrl = uploadedAudioUrlCyrl
      }
    }

    const testData = {
      image_url: finalImageUrl,
      // Latin
      question,
      answers,
      explanation_title: explanationTitle.trim() || null,
      explanation_text: explanationText.trim() || null,
      audio_url: finalAudioUrl || null,
      // Cyrillic
      question_cyrl: questionCyrl.trim() || null,
      answers_cyrl: answersCyrl.length === answers.length ? answersCyrl : null,
      explanation_title_cyrl: explanationTitleCyrl.trim() || null,
      explanation_text_cyrl: explanationTextCyrl.trim() || null,
      audio_url_cyrl: finalAudioUrlCyrl || null,

      correct_answer: parseInt(correctAnswer),
      time_limit: parseInt(timeLimit),
      category: category.trim(),
      topic_id: null // Ensure topic_id is null as we use category
    }

    if (editingTest) {
      const { error } = await supabase
        .from("tests")
        .update(testData)
        .eq("id", editingTest.id)

      if (error) {
        toast({
          title: "Error",
          description: "Testni yangilashda xatolik yuz berdi",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Test muvaffaqiyatli yangilandi",
        })
        resetForm()
        fetchTests()
      }
    } else {
      const { data: newTest, error } = await supabase.from("tests").insert(testData).select().single()

      if (error) {
        toast({
          title: "Error",
          description: "Testni yaratishda xatolik yuz berdi",
          variant: "destructive",
        })
      } else if (newTest && selectedTicket) {
        // Add test to ticket
        const { data: ticketTests } = await supabase
          .from("ticket_tests")
          .select("order_index")
          .eq("ticket_id", selectedTicket)
          .order("order_index", { ascending: false })
          .limit(1)

        const nextOrder = ticketTests && ticketTests.length > 0 ? ticketTests[0].order_index + 1 : 0

        const { error: linkError } = await supabase.from("ticket_tests").insert({
          ticket_id: selectedTicket,
          test_id: newTest.id,
          order_index: nextOrder,
        })

        if (linkError) {
          toast({
            title: "Warning",
            description: "Test yaratildi, lekin biletga qo'shishda xatolik: " + linkError.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Test muvaffaqiyatli yaratildi va biletga qo'shildi",
          })
          resetForm()
          fetchTests()
        }
      } else {
        toast({
          title: "Success",
          description: "Test muvaffaqiyatli yaratildi",
        })
        resetForm()
        fetchTests()
      }
    }
  }

  const handleEdit = (test: TestWithRelation) => {
    setEditingTest(test)
    // For editing, we don't necessarily change the ticket unless we implement that logic
    // But we should set the Category
    setCategory(test.category || "")
    setImageUrl(test.image_url)
    setImagePreview(test.image_url)
    setAudioUrl(test.audio_url || "")
    setAudioPreview(test.audio_url || null)
    setImageFile(null)
    setAudioFile(null)
    setQuestion(test.question)
    setQuestionCyrl(test.question_cyrl || "")
    setAnswers(test.answers)
    setAnswersCyrl(test.answers_cyrl || Array(test.answers.length).fill(""))
    setCorrectAnswer(test.correct_answer.toString())
    setTimeLimit(test.time_limit.toString())
    setExplanationTitle(test.explanation_title || "")
    setExplanationTitleCyrl(test.explanation_title_cyrl || "")
    setExplanationText(test.explanation_text || "")
    setExplanationTextCyrl(test.explanation_text_cyrl || "")
    setAudioUrlCyrl(test.audio_url_cyrl || "")
    setAudioPreviewCyrl(test.audio_url_cyrl || null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu testni o'chirishni xohlaysizmi?")) return

    const { error } = await supabase.from("tests").delete().eq("id", id)

    if (error) {
      toast({
        title: "Error",
        description: "Testni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Test muvaffaqiyatli o'chirildi",
      })
      fetchTests()
    }
  }

  const testsByCategory = tests.reduce((acc, test) => {
    const cat = test.category || "Uncategorized"
    if (!acc[cat]) {
      acc[cat] = []
    }
    acc[cat].push(test)
    return acc
  }, {} as Record<string, TestWithRelation[]>)

  return (
    <Tabs defaultValue="create" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="create">{editingTest ? "Testni tahrirlash" : "Test yaratish"}</TabsTrigger>
        <TabsTrigger value="view">Testlar ko'rish</TabsTrigger>
      </TabsList>

      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>{editingTest ? "Testni tahrirlash" : "Test yaratish"}</CardTitle>
            <CardDescription>
              {editingTest ? "Test haqida ma'lumotlarni yangilash" : "Yangi test yaratish - Barcha testlar biletga biriktiriladi"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {!editingTest && (
                <div className="space-y-2">
                  <Label htmlFor="ticket">Bilet (Majburiy)</Label>
                  <Select value={selectedTicket} onValueChange={setSelectedTicket}>
                    <SelectTrigger>
                      <SelectValue placeholder="Biletni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {tickets.map((ticket) => (
                        <SelectItem key={ticket.id} value={ticket.id}>
                          {ticket.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category">Kategoriya (Mavzu)</Label>
                <Input
                  id="category"
                  placeholder="Kategoriya nomini kiriting (masalan: Yo'l belgilari)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Rasm</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingTest && !imageUrl}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="max-w-xs rounded-lg border" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio">Audio (Optional)</Label>
                <Input
                  id="audio"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                />
                {audioPreview && (
                  <div className="mt-2">
                    <audio controls src={audioPreview} className="w-full" />
                  </div>
                )}
              </div>

              <div className="space-y-4 border p-4 rounded-lg bg-zinc-50/50">
                <Tabs defaultValue="latin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="latin">Lotin (O'zbekcha)</TabsTrigger>
                    <TabsTrigger value="cyrillic">Kirill (Ўзбекcha)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="latin" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="question">Savol (Lotin)</Label>
                      <Textarea
                        id="question"
                        placeholder="Savolni kiriting..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audio">Audio (Lotin, Optional)</Label>
                      <Input
                        id="audio"
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioChange}
                      />
                      {audioPreview && (
                        <div className="mt-2">
                          <audio controls src={audioPreview} className="w-full" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="explanation-title">Tushuntirish sarlavhasi (Lotin, Optional)</Label>
                      <Input
                        id="explanation-title"
                        placeholder="Tushuntirish sarlavhasi..."
                        value={explanationTitle}
                        onChange={(e) => setExplanationTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="explanation-text">Tushuntirish matni (Lotin, Optional)</Label>
                      <Textarea
                        id="explanation-text"
                        placeholder="Tushuntirish matni..."
                        value={explanationText}
                        onChange={(e) => setExplanationText(e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="cyrillic" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="question-cyrl">Savol (Kirill)</Label>
                      <Textarea
                        id="question-cyrl"
                        placeholder="Саволни киритинг..."
                        value={questionCyrl}
                        onChange={(e) => setQuestionCyrl(e.target.value)}
                        required={!!question} // If one is present, both should be? User might want to start with one.
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audio-cyrl">Audio (Kirill, Optional)</Label>
                      <Input
                        id="audio-cyrl"
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioCyrlChange}
                      />
                      {audioPreviewCyrl && (
                        <div className="mt-2">
                          <audio controls src={audioPreviewCyrl} className="w-full" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="explanation-title-cyrl">Tushuntirish sarlavhasi (Kirill, Optional)</Label>
                      <Input
                        id="explanation-title-cyrl"
                        placeholder="Тушунтириш сарлавҳаси..."
                        value={explanationTitleCyrl}
                        onChange={(e) => setExplanationTitleCyrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="explanation-text-cyrl">Tushuntirish matni (Kirill, Optional)</Label>
                      <Textarea
                        id="explanation-text-cyrl"
                        placeholder="Тушунтириш матни..."
                        value={explanationTextCyrl}
                        onChange={(e) => setExplanationTextCyrl(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Javoblar (Kamida 2 ta)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAnswers([...answers, ""])
                      setAnswersCyrl([...answersCyrl, ""])
                    }}
                    className="h-8 gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Javob qo'shish
                  </Button>
                </div>
                <div className="space-y-4">
                  {answers.map((_, index) => (
                    <Card key={index} className="p-4 bg-zinc-50/30">
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-xs font-bold uppercase text-zinc-500">Javob {index + 1}</Label>
                        {answers.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              const newAnswers = answers.filter((_, i) => i !== index)
                              const newAnswersCyrl = answersCyrl.filter((_, i) => i !== index)
                              setAnswers(newAnswers)
                              setAnswersCyrl(newAnswersCyrl)
                              if (parseInt(correctAnswer) >= newAnswers.length) {
                                setCorrectAnswer((newAnswers.length - 1).toString())
                              }
                            }}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Lotin</Label>
                          <Input
                            placeholder={`Javob ${index + 1} (Lotin)`}
                            value={answers[index]}
                            onChange={(e) => {
                              const newAnswers = [...answers]
                              newAnswers[index] = e.target.value
                              setAnswers(newAnswers)
                            }}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Kirill</Label>
                          <Input
                            placeholder={`Жавоб ${index + 1} (Кирилл)`}
                            value={answersCyrl[index] || ""}
                            onChange={(e) => {
                              const newAnswersCyrl = [...answersCyrl]
                              newAnswersCyrl[index] = e.target.value
                              setAnswersCyrl(newAnswersCyrl)
                            }}
                            required={!!answers[index]}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="correct">To'g'ri javob</Label>
                  <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {answers.map((_, idx) => (
                        <SelectItem key={idx} value={idx.toString()}>
                          Javob {idx + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Vaqt chegarasi (sekundlar)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    min="60"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={uploadingImage || uploadingAudio}>
                  {uploadingImage || uploadingAudio
                    ? "Yuklanmoqda..."
                    : editingTest
                      ? "Testni tahrirlash"
                      : "Test yaratish"}
                </Button>
                {editingTest && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Bekor qilish
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="view">
        {loading ? (
          <div className="text-center py-8">Testlar yuklanmoqda...</div>
        ) : Object.keys(testsByCategory).length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Hozircha testlar mavjud emas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(testsByCategory).map(([catTitle, catTests]) => (
              <Card key={catTitle}>
                <CardHeader>
                  <CardTitle>{catTitle}</CardTitle>
                  <CardDescription>{catTests.length} test(lar)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {catTests.map((test) => (
                      <div key={test.id} className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <p className="font-medium">{test.question}</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>To'g'ri javob: Javob {test.correct_answer + 1}</p>
                            </div>
                            <div className="text-sm">
                              <p className="font-medium mb-1">Javoblar:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {test.answers.map((answer, idx) => (
                                  <li key={idx} className={idx === test.correct_answer ? "text-green-600 font-medium" : ""}>
                                    {answer}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(test)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(test.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}