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
import type { Test, Ticket, Topic } from "@/lib/types"

interface TestWithRelation extends Test {
  ticket_title?: string
}

export function TestsManagement() {
  const [tests, setTests] = useState<TestWithRelation[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState("")
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [audioUrlCyrl, setAudioUrlCyrl] = useState("")
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
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchTests()
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    const { data } = await supabase.from("topics").select("*").order("title")
    if (data) setTopics(data)
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
    setSelectedTopicId("")
    setCategory("")
    setImageUrl("")
    setAudioUrl("")
    setAudioUrlCyrl("")
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
    setEditingTest(null)
  }

  const cleanUrl = (url: string) => {
    if (!url) return ""
    let cleaned = url.trim()

    // 1. Handle BBCode [img] tags (common with postimg.cc)
    const bbCodeImgMatch = cleaned.match(/\[img\](https?:\/\/[^\[]+)\[\/img\]/i)
    if (bbCodeImgMatch) {
      cleaned = bbCodeImgMatch[1]
    } else {
      // 2. Extract first URL found in string, checking for both http(s):// and http(s):/
      const urlMatch = cleaned.match(/https?:(?:\/){1,2}[^\s\][()]+/i)
      if (urlMatch) {
        cleaned = urlMatch[0]
      }
    }

    // 3. Fix single slash mistakes (e.g., https:/postimg.cc -> https://postimg.cc)
    if (cleaned.toLowerCase().startsWith('https:/') && !cleaned.toLowerCase().startsWith('https://')) {
      cleaned = cleaned.replace(/https?:\//i, (match) => match.toLowerCase().includes('s') ? 'https://' : 'http://')
    } else if (cleaned.toLowerCase().startsWith('http:/') && !cleaned.toLowerCase().startsWith('http://')) {
      cleaned = cleaned.replace('http:/', 'http://')
    }

    // 4. If it's just a domain (e.g., postimg.cc/abc), add https://
    if (!cleaned.startsWith('http') && cleaned.includes('.')) {
      cleaned = 'https://' + cleaned
    }

    return cleaned
  }

  useEffect(() => {
    // Debug: Log Supabase config (masked)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING"
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "MISSING"
    console.log("Supabase Config Check:", {
      url: url.substring(0, 15) + "...",
      key: key.length > 10 ? (key.substring(0, 5) + "..." + key.substring(key.length - 5)) : "INVALID"
    })

    // Debug: Check session
    supabase.auth.getSession().then(({ data }) => {
      console.log("Browser Session Status:", data.session ? `Logged in as ${data.session.user.email}` : "Not logged in")
    })
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!selectedTopicId) {
      toast({
        title: "Xatolik",
        description: "Mavzuni (Topic) tanlang",
        variant: "destructive",
      })
      return
    }

    const finalImageUrl = cleanUrl(imageUrl)

    if (!finalImageUrl || !question) {
      toast({
        title: "Xatolik",
        description: "Barcha majburiy maydonlarni to'ldiring (Yaroqli Rasm URL va Savol)",
        variant: "destructive",
      })
      return
    }

    if (answers.some((a) => !a.trim())) {
      toast({
        title: "Xatolik",
        description: `Barcha ${answers.length} javoblarni kiriting`,
        variant: "destructive",
      })
      return
    }

    const testData: any = {
      image_url: finalImageUrl,
      // Latin
      question: question.trim(),
      answers: answers.map(a => a.trim()),
      explanation_title: explanationTitle.trim() || null,
      explanation_text: explanationText.trim() || null,
      audio_url: cleanUrl(audioUrl) || null,
      // Cyrillic
      question_cyrl: questionCyrl.trim() || null,
      answers_cyrl: answersCyrl.some(a => a.trim() !== "") ? answersCyrl.map(a => a.trim()) : null,
      explanation_title_cyrl: explanationTitleCyrl.trim() || null,
      explanation_text_cyrl: explanationTextCyrl.trim() || null,
      audio_url_cyrl: cleanUrl(audioUrlCyrl) || null,

      correct_answer: parseInt(correctAnswer) || 0,
      time_limit: parseInt(timeLimit) || 300,
      category: category.trim(),
      topic_id: selectedTopicId,
    }

    console.log("Submitting test data:", testData);

    if (editingTest) {
      const { error } = await supabase
        .from("tests")
        .update(testData)
        .eq("id", editingTest.id)

      if (error) {
        console.error("Update failed! Full error object:", error);
        console.error("Error keys:", Object.keys(error));
        console.error("Error stringified:", JSON.stringify(error));
        toast({
          title: "Xatolik",
          description: `Update failed: ${error.message} (Code: ${error.code})`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Muvaffaqiyatli",
          description: "Test muvaffaqiyatli yangilandi",
        })
        resetForm()
        fetchTests()
      }
    } else {
      const { error } = await supabase.from("tests").insert(testData)

      if (error) {
        console.error("Insert failed! Full error object:", error);
        console.error("Error keys:", Object.keys(error));
        console.error("Error stringified:", JSON.stringify(error));
        toast({
          title: "Xatolik",
          description: `Insert failed: ${error.message} (Code: ${error.code})`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Muvaffaqiyatli",
          description: "Test muvaffaqiyatli yaratildi",
        })
        resetForm()
        fetchTests()
      }
    }
  }

  const handleEdit = (test: TestWithRelation) => {
    setEditingTest(test)
    setSelectedTopicId(test.topic_id || "")
    setCategory(test.category || "")
    setImageUrl(test.image_url)
    setAudioUrl(test.audio_url || "")
    setAudioUrlCyrl(test.audio_url_cyrl || "")
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
              {editingTest ? "Test haqida ma'lumotlarni yangilash" : "Yangi test yaratish - Barcha testlar avtomatik ravishda biletlarga bo'linadi (20 tadan)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {!editingTest && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-primary">
                  <p>Yangi test {Math.floor(tests.length / 20) + 1}-biletga qo'shiladi.</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="topic">Mavzu (Topic)</Label>
                <Select
                  value={selectedTopicId}
                  onValueChange={(val) => {
                    setSelectedTopicId(val)
                    const selectedTopic = topics.find(t => t.id === val)
                    if (selectedTopic) setCategory(selectedTopic.title)
                  }}
                >
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="Mavzuni tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategoriya (Avtomatik to'ldiriladi)</Label>
                <Input
                  id="category"
                  placeholder="Kategoriya kodi yoki nomi"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Rasm URL</Label>
                <Input
                  id="image"
                  placeholder="Rasm URL manzilini kiriting..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required={!editingTest}
                />
                {imageUrl && (
                  <div className="mt-2">
                    <img src={cleanUrl(imageUrl)} alt="Preview" className="max-w-xs rounded-lg border" />
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
                      <Label htmlFor="audio">Audio URL (Lotin, Optional)</Label>
                      <Input
                        id="audio"
                        placeholder="Audio URL manzilini kiriting..."
                        value={audioUrl}
                        onChange={(e) => setAudioUrl(e.target.value)}
                      />
                      {audioUrl && (
                        <div className="mt-2">
                          <audio controls src={audioUrl} className="w-full" />
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audio-cyrl">Audio URL (Kirill, Optional)</Label>
                      <Input
                        id="audio-cyrl"
                        placeholder="Audio URL manzilini киритинг..."
                        value={audioUrlCyrl}
                        onChange={(e) => setAudioUrlCyrl(e.target.value)}
                      />
                      {audioUrlCyrl && (
                        <div className="mt-2">
                          <audio controls src={audioUrlCyrl} className="w-full" />
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
                <div className="space-y-2">
                  {answers.map((_, index) => (
                    <div key={index} className="flex gap-4 items-start border p-3 rounded-lg bg-zinc-50/30">
                      <div className="flex-1 space-y-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-zinc-500 font-bold">Lotin {index + 1}</Label>
                            <Input
                              placeholder={`Javob ${index + 1}`}
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
                            <Label className="text-[10px] uppercase text-zinc-500 font-bold">Kirill {index + 1}</Label>
                            <Input
                              placeholder={`Жавоб ${index + 1}`}
                              value={answersCyrl[index] || ""}
                              onChange={(e) => {
                                const newAnswersCyrl = [...answersCyrl]
                                newAnswersCyrl[index] = e.target.value
                                setAnswersCyrl(newAnswersCyrl)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      {answers.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="mt-6 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setAnswers(answers.filter((_, i) => i !== index))
                            setAnswersCyrl(answersCyrl.filter((_, i) => i !== index))
                            if (parseInt(correctAnswer) >= answers.length - 1) {
                              setCorrectAnswer("0")
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="correct">To'g'ri javob</Label>
                  <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                    <SelectTrigger id="correct">
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
                    min="10"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingTest ? "Testni tahrirlash" : "Test yaratish"}
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