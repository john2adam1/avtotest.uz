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
    <Tabs defaultValue="create" className="space-y-8">
      <TabsList className="grid w-full grid-cols-2 bg-gray-200 p-1 border-2 border-gray-300">
        <TabsTrigger value="create" className="text-xl font-bold py-3 data-[state=active]:bg-[#1976d2] data-[state=active]:text-white rounded-none">{editingTest ? "Testni tahrirlash" : "Test yaratish"}</TabsTrigger>
        <TabsTrigger value="view" className="text-xl font-bold py-3 data-[state=active]:bg-[#1976d2] data-[state=active]:text-white rounded-none">Testlar ko'rish</TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="space-y-8 mt-6">
        <div className="pb-4 border-b-2 border-gray-300">
          <h2 className="text-2xl font-bold">{editingTest ? "Testni tahrirlash" : "Test yaratish"}</h2>
          <p className="text-gray-500">
            {editingTest ? "Test haqida ma'lumotlarni yangilash" : "Yangi test yaratish - Barcha testlar avtomatik ravishda biletlarga bo'linadi (20 tadan)"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {!editingTest && (
            <div className="bg-[#1976d2]/5 border-2 border-[#1976d2]/30 p-4 text-lg text-[#1976d2] font-bold">
              <p>Yangi test {Math.floor(tests.length / 20) + 1}-biletga qo'shiladi.</p>
            </div>
          )}

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="topic" className="text-lg font-bold">Mavzu (Topic)</Label>
              <Select
                value={selectedTopicId}
                onValueChange={(val) => {
                  setSelectedTopicId(val)
                  const selectedTopic = topics.find(t => t.id === val)
                  if (selectedTopic) setCategory(selectedTopic.title)
                }}
              >
                <SelectTrigger id="topic" className="h-14 border-2 border-gray-300 rounded-none bg-white text-lg">
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

            <div className="space-y-3">
              <Label htmlFor="category" className="text-lg font-bold">Kategoriya</Label>
              <Input
                id="category"
                className="h-14 border-2 border-gray-300 rounded-none bg-white text-lg"
                placeholder="Kategoriya kodi yoki nomi"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="image" className="text-lg font-bold">Rasm URL</Label>
            <Input
              id="image"
              className="h-14 border-2 border-gray-300 rounded-none bg-white text-lg"
              placeholder="Rasm URL manzilini kiriting..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required={!editingTest}
            />
            {imageUrl && (
              <div className="mt-4">
                <img src={cleanUrl(imageUrl)} alt="Preview" className="max-w-md border-4 border-white shadow-none" />
              </div>
            )}
          </div>

          <div className="space-y-6 border-2 border-gray-300 p-8 bg-white/50">
            <Tabs defaultValue="latin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-200">
                <TabsTrigger value="latin" className="py-3 font-bold rounded-none">Lotin (O'zbekcha)</TabsTrigger>
                <TabsTrigger value="cyrillic" className="py-3 font-bold rounded-none">Kirill (Ўзбекcha)</TabsTrigger>
              </TabsList>

              <TabsContent value="latin" className="space-y-6 mt-6">
                <div className="space-y-3">
                  <Label htmlFor="question" className="text-lg font-bold">Savol (Lotin)</Label>
                  <Textarea
                    id="question"
                    className="min-h-[120px] border-2 border-gray-300 rounded-none bg-white text-lg"
                    placeholder="Savolni kiriting..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="audio" className="text-lg font-bold">Audio URL (Lotin, Optional)</Label>
                  <Input
                    id="audio"
                    className="h-14 border-2 border-gray-300 rounded-none bg-white text-lg"
                    placeholder="Audio URL manzilini kiriting..."
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="explanation-title" className="text-lg font-bold">Tushuntirish sarlavhasi (Lotin, Optional)</Label>
                  <Input
                    id="explanation-title"
                    className="h-14 border-2 border-gray-300 rounded-none bg-white text-lg"
                    placeholder="Tushuntirish sarlavhasi..."
                    value={explanationTitle}
                    onChange={(e) => setExplanationTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="explanation-text" className="text-lg font-bold">Tushuntirish matni (Lotin, Optional)</Label>
                  <Textarea
                    id="explanation-text"
                    className="min-h-[100px] border-2 border-gray-300 rounded-none bg-white text-lg"
                    placeholder="Tushuntirish matni..."
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="cyrillic" className="space-y-6 mt-6">
                <div className="space-y-3">
                  <Label htmlFor="question-cyrl" className="text-lg font-bold">Savol (Kirill)</Label>
                  <Textarea
                    id="question-cyrl"
                    className="min-h-[120px] border-2 border-gray-300 rounded-none bg-white text-lg"
                    placeholder="Саволни киритинг..."
                    value={questionCyrl}
                    onChange={(e) => setQuestionCyrl(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="audio-cyrl" className="text-lg font-bold">Audio URL (Kirill, Optional)</Label>
                  <Input
                    id="audio-cyrl"
                    className="h-14 border-2 border-gray-300 rounded-none bg-white text-lg"
                    placeholder="Audio URL manzilini киритинг..."
                    value={audioUrlCyrl}
                    onChange={(e) => setAudioUrlCyrl(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="explanation-title-cyrl" className="text-lg font-bold">Tushuntirish sarlavhasi (Kirill, Optional)</Label>
                  <Input
                    id="explanation-title-cyrl"
                    className="h-14 border-2 border-gray-300 rounded-none bg-white text-lg"
                    placeholder="Тушунтириш сарлавҳаси..."
                    value={explanationTitleCyrl}
                    onChange={(e) => setExplanationTitleCyrl(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="explanation-text-cyrl" className="text-lg font-bold">Tushuntirish matni (Kirill, Optional)</Label>
                  <Textarea
                    id="explanation-text-cyrl"
                    className="min-h-[100px] border-2 border-gray-300 rounded-none bg-white text-lg"
                    placeholder="Тушунтириш матни..."
                    value={explanationTextCyrl}
                    onChange={(e) => setExplanationTextCyrl(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b-2 border-gray-300">
              <Label className="text-2xl font-bold text-[#1976d2]">Javoblar</Label>
              <Button
                type="button"
                className="h-12 px-6 bg-[#1976d2] text-white font-bold"
                onClick={() => {
                  setAnswers([...answers, ""])
                  setAnswersCyrl([...answersCyrl, ""])
                }}
              >
                <Plus className="mr-2 h-5 w-5" />
                Javob qo'shish
              </Button>
            </div>

            <div className="space-y-6">
              {answers.map((_, index) => (
                <div key={index} className="border-2 border-gray-300 p-6 bg-white flex gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold uppercase text-gray-500">Lotin {index + 1}</Label>
                        <Input
                          className="h-12 border-2 border-gray-300 rounded-none text-lg"
                          value={answers[index]}
                          onChange={(e) => {
                            const newAnswers = [...answers]
                            newAnswers[index] = e.target.value
                            setAnswers(newAnswers)
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold uppercase text-gray-500">Kirill {index + 1}</Label>
                        <Input
                          className="h-12 border-2 border-gray-300 rounded-none text-lg"
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
                      className="h-12 w-12 bg-red-50 text-red-600 border-2 border-red-200 mt-7"
                      onClick={() => {
                        setAnswers(answers.filter((_, i) => i !== index))
                        setAnswersCyrl(answersCyrl.filter((_, i) => i !== index))
                        if (parseInt(correctAnswer) >= answers.length - 1) {
                          setCorrectAnswer("0")
                        }
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="correct" className="text-lg font-bold">To'g'ri javob</Label>
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger id="correct" className="h-14 border-2 border-gray-300 rounded-none bg-white text-lg">
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

            <div className="space-y-3">
              <Label htmlFor="time" className="text-lg font-bold">Vaqt chegarasi (sekundlar)</Label>
              <Input
                id="time"
                type="number"
                className="h-14 border-2 border-gray-300 rounded-none bg-white text-lg"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                min="10"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" className="flex-1 h-16 text-2xl bg-[#1976d2] font-bold">
              {editingTest ? "Testni tahrirlash" : "Test yaratish"}
            </Button>
            {editingTest && (
              <Button type="button" variant="outline" className="h-16 px-10 text-xl border-2 border-gray-400 font-bold" onClick={resetForm}>
                Bekor qilish
              </Button>
            )}
          </div>
        </form>
      </TabsContent>

      <TabsContent value="view" className="space-y-8 mt-6">
        {loading ? (
          <div className="text-center py-12 text-2xl font-bold">Testlar yuklanmoqda...</div>
        ) : Object.keys(testsByCategory).length === 0 ? (
          <div className="py-12 border-2 border-gray-300 bg-white text-center text-xl font-bold">
            Hozircha testlar mavjud emas
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(testsByCategory).map(([catTitle, catTests]) => (
              <div key={catTitle} className="space-y-4">
                <div className="pb-2 border-b-2 border-[#1976d2]/30 flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{catTitle}</h3>
                  <span className="text-lg font-bold text-gray-500">{catTests.length} test(lar)</span>
                </div>
                <div className="grid gap-6">
                  {catTests.map((test) => (
                    <div key={test.id} className="border-2 border-gray-300 bg-white p-6 flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <p className="text-xl font-bold">{test.question}</p>
                        <div className="text-lg">
                          <p className="font-bold mb-2">Javoblar:</p>
                          <ul className="space-y-2">
                            {test.answers.map((answer, idx) => (
                              <li key={idx} className={idx === test.correct_answer ? "text-[#3ca64c] font-bold flex items-center" : "text-gray-600 flex items-center"}>
                                <div className={`w-3 h-3 rounded-full mr-3 ${idx === test.correct_answer ? "bg-[#3ca64c]" : "border-2 border-gray-400"}`} />
                                {answer}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-6">
                        <Button className="h-12 w-12 bg-gray-100 text-gray-700 border-2 border-gray-300 flex items-center justify-center p-0" onClick={() => handleEdit(test)}>
                          <Edit2 className="h-5 w-5" />
                        </Button>
                        <Button className="h-12 w-12 bg-red-50 text-red-600 border-2 border-red-200 flex items-center justify-center p-0" onClick={() => handleDelete(test.id)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
