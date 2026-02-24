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
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2, Plus, X, BookOpen } from "lucide-react"
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
  const [explanationText, setExplanationText] = useState("")
  const [explanationTextCyrl, setExplanationTextCyrl] = useState("")
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      setLoading(true)
      const [testsRes, topicsRes] = await Promise.all([
        supabase.from("tests").select("*").order("created_at", { ascending: false }),
        supabase.from("topics").select("*").order("title")
      ])

      if (!isMounted) return

      if (testsRes.data) setTests(testsRes.data)
      if (topicsRes.data) setTopics(topicsRes.data)
      setLoading(false)
    }
    loadAll()
    return () => { isMounted = false }
  }, [])

  const fetchTopics = async () => {
    const { data } = await supabase.from("topics").select("*").order("title")
    if (data) setTopics(data)
  }

  const fetchTests = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("tests")
      .select(`*`)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Xatolik",
        description: "Testlarni yuklashda xatolik: " + error.message,
        variant: "destructive"
      })
    }

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
      explanation_title: null,
      explanation_text: explanationText.trim() || null,
      audio_url: cleanUrl(audioUrl) || null,
      // Cyrillic
      question_cyrl: questionCyrl.trim() || null,
      answers_cyrl: answersCyrl.some(a => a.trim() !== "") ? answersCyrl.map(a => a.trim()) : null,
      explanation_title_cyrl: null,
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Testlar Boshqaruvi</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Savollar bankini kengaytirish va tahrirlash</p>
        </div>
        <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-xl h-auto shadow-inner">
          <TabsTrigger value="create" className="px-4 py-2 text-xs font-bold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-500 transition-all">
            {editingTest ? "Tahrirlash" : "Yaratish"}
          </TabsTrigger>
          <TabsTrigger value="view" className="px-4 py-2 text-xs font-bold rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-500 transition-all">
            Ko'rish
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="create" className="space-y-8 m-0 border-none outline-none">
        <form onSubmit={handleSubmit} className="space-y-8">
          {!editingTest && (
            <div className="bg-white border border-blue-100 p-4 rounded-3xl bg-blue-50/30 flex items-center gap-4 relative overflow-hidden group shadow-sm">
              <div className="absolute right-0 top-0 p-4 opacity-5 scale-150 group-hover:scale-[1.7] transition-transform duration-700">
                <Plus className="h-12 w-12 text-blue-600" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200 relative z-10">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-700 relative z-10">
                Yangi test <span className="text-blue-600 font-black ml-1 text-base">#{Math.floor(tests.length / 20) + 1}-biletga</span> qo'shiladi.
              </p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Asosiy ma'lumotlar</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="topic" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mavzu (Topic)</Label>
                  <Select
                    value={selectedTopicId}
                    onValueChange={(val) => {
                      setSelectedTopicId(val)
                      const selectedTopic = topics.find(t => t.id === val)
                      if (selectedTopic) setCategory(selectedTopic.title)
                    }}
                  >
                    <SelectTrigger id="topic" className="h-11 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-bold text-sm px-4 focus:ring-blue-500/50">
                      <SelectValue placeholder="Mavzuni tanlang..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-100 rounded-xl text-slate-900 shadow-3xl">
                      {topics.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="hover:bg-slate-50 focus:bg-slate-50 rounded-lg py-2 text-sm font-bold">
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Kategoriya</Label>
                  <Input
                    id="category"
                    className="h-11 bg-slate-50 border-slate-100 rounded-xl text-slate-900 text-sm font-bold placeholder:text-slate-400 focus:ring-blue-500/50 px-4"
                    placeholder="Avtomatik to'ldiriladi..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Media va Vaqt</h3>
              </div>

              <div className="space-y-4 text-slate-900">
                <div className="space-y-1.5">
                  <Label htmlFor="image" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Rasm URL</Label>
                  <Input
                    id="image"
                    className="h-11 bg-slate-50 border-slate-100 rounded-xl text-slate-900 text-sm font-bold placeholder:text-slate-400 focus:ring-blue-500/50 px-4"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required={!editingTest}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Vaqt (sekund)</Label>
                  <Input
                    id="time"
                    type="number"
                    className="h-11 bg-slate-50 border-slate-100 rounded-xl text-slate-900 text-sm font-bold focus:ring-blue-500/50 px-4"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    min="10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {imageUrl && (
            <div className="flex justify-center">
              <div className="p-4 bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-blue-500/5">
                <img src={cleanUrl(imageUrl)} alt="Preview" className="max-w-xl max-h-[400px] rounded-[2.5rem] shadow-2xl object-contain border-4 border-slate-50" />
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-3xl p-6 overflow-hidden relative shadow-sm">
            <Tabs defaultValue="latin" className="w-full relative z-10">
              <TabsList className="inline-flex h-auto p-0.5 bg-slate-100 border border-slate-200 rounded-xl mb-6 shadow-inner">
                <TabsTrigger value="latin" className="px-6 py-2 font-black tracking-tight rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 transition-all uppercase text-[10px]">Lotincha</TabsTrigger>
                <TabsTrigger value="cyrillic" className="px-6 py-2 font-black tracking-tight rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500 transition-all uppercase text-[10px]">Kirillcha</TabsTrigger>
              </TabsList>

              <TabsContent value="latin" className="space-y-6 m-0 outline-none">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="question" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Savol (Lotin)</Label>
                      <Textarea
                        id="question"
                        className="min-h-[120px] bg-slate-50 border-slate-100 rounded-2xl text-slate-900 text-base font-bold p-5 focus:ring-blue-500/50 transition-all leading-relaxed"
                        placeholder="Savol matnini bu yerga kiriting..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="audio" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Audio URL</Label>
                      <Input
                        id="audio"
                        className="h-11 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-bold px-4 text-xs"
                        placeholder="Audio manzilini kiriting..."
                        value={audioUrl}
                        onChange={(e) => setAudioUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="explanation-text" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tushuntirish Matni</Label>
                      <Textarea
                        id="explanation-text"
                        className="min-h-[178px] bg-slate-50 border-slate-100 rounded-2xl text-slate-600 font-medium p-5 focus:ring-blue-500/50 transition-all leading-relaxed text-sm"
                        placeholder="Qoida yoki sharh..."
                        value={explanationText}
                        onChange={(e) => setExplanationText(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="cyrillic" className="space-y-6 m-0 outline-none">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="question-cyrl" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Savol (Kirill)</Label>
                      <Textarea
                        id="question-cyrl"
                        className="min-h-[120px] bg-slate-50 border-slate-100 rounded-2xl text-slate-900 text-base font-bold p-5 focus:ring-blue-500/50 transition-all leading-relaxed"
                        placeholder="Савол матнини киритинг..."
                        value={questionCyrl}
                        onChange={(e) => setQuestionCyrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="audio-cyrl" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Audio URL (Kirill)</Label>
                      <Input
                        id="audio-cyrl"
                        className="h-11 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-bold px-4 text-xs"
                        placeholder="Audio манзилини киритинг..."
                        value={audioUrlCyrl}
                        onChange={(e) => setAudioUrlCyrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="explanation-text-cyrl" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Тушунтириш Матни</Label>
                      <Textarea
                        id="explanation-text-cyrl"
                        className="min-h-[178px] bg-slate-50 border-slate-100 rounded-2xl text-slate-600 font-medium p-5 focus:ring-blue-500/50 transition-all leading-relaxed text-sm"
                        placeholder="Қоида ёki шарҳ..."
                        value={explanationTextCyrl}
                        onChange={(e) => setExplanationTextCyrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight italic">Javob Variantlari</h3>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mt-1">Kamida 2 ta javob</p>
              </div>
              <Button
                type="button"
                className="h-10 px-6 bg-blue-50 hover:bg-blue-100 text-blue-600 font-black rounded-xl border border-blue-200 transition-all uppercase text-[10px] tracking-widest shadow-sm"
                onClick={() => {
                  setAnswers([...answers, ""])
                  setAnswersCyrl([...answersCyrl, ""])
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Qo'shish
              </Button>
            </div>

            <div className="grid gap-3">
              {answers.map((_, index) => (
                <div key={index} className="group relative bg-white border border-slate-100 p-4 rounded-2xl transition-all duration-300 hover:border-blue-200 shadow-sm hover:shadow-md">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    <div className="h-10 min-w-[2.5rem] rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-lg text-slate-300 group-hover:text-blue-600 transition-colors">
                      {index + 1}
                    </div>

                    <div className="flex-1 grid gap-4 sm:grid-cols-2 w-full">
                      <div className="space-y-1">
                        <Input
                          className="h-10 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-bold px-4 focus:ring-blue-500/50 text-sm"
                          placeholder="Lotincha variant..."
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
                        <Input
                          className="h-10 bg-slate-50 border-slate-100 rounded-xl text-slate-900 font-bold px-4 focus:ring-blue-500/50 text-sm"
                          placeholder="Кириллcha variant..."
                          value={answersCyrl[index] || ""}
                          onChange={(e) => {
                            const newAnswersCyrl = [...answersCyrl]
                            newAnswersCyrl[index] = e.target.value
                            setAnswersCyrl(newAnswersCyrl)
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <Button
                        type="button"
                        variant="ghost"
                        className={`h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex-1 lg:flex-none border ${correctAnswer === index.toString()
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                          : "bg-slate-50 text-slate-400 border-slate-100 hover:text-slate-900"
                          }`}
                        onClick={() => setCorrectAnswer(index.toString())}
                      >
                        {correctAnswer === index.toString() ? "To'g'ri" : "Tanlash"}
                      </Button>

                      {answers.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-10 w-10 shrink-0 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition-all"
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-8 border-t border-slate-100">
            <Button
              type="submit"
              className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all text-sm uppercase tracking-widest border-none"
            >
              {editingTest ? "Saqlash" : "Tayyor"}
            </Button>
            {editingTest && (
              <Button type="button" variant="ghost" className="h-14 px-8 text-sm bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl border border-slate-200 transition-all" onClick={resetForm}>
                Bekor qilish
              </Button>
            )}
          </div>
        </form>
      </TabsContent>

      <TabsContent value="view" className="space-y-8 m-0 border-none outline-none">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <div className="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Yuklanmoqda...</p>
          </div>
        ) : Object.keys(testsByCategory).length === 0 ? (
          <div className="py-20 bg-white border border-slate-100 rounded-3xl text-center space-y-4 shadow-sm">
            <X className="h-10 w-10 text-slate-100 mx-auto" />
            <p className="text-slate-300 text-xl font-black italic tracking-tighter">Hozircha testlar mavjud emas</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(testsByCategory).map(([catTitle, catTests]) => (
              <div key={catTitle} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase"><span className="text-blue-600 mr-2">#</span> {catTitle}</h3>
                  <Badge className="rounded-lg bg-white border border-slate-100 text-slate-400 px-3 py-1 font-black tracking-widest text-[10px] uppercase shadow-sm">
                    {catTests.length} TEST
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {catTests.map((test) => (
                    <div key={test.id} className="group bg-white border border-slate-100 hover:border-blue-200 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md">
                      <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                        {test.image_url && (
                          <div className="w-full lg:w-40 h-28 shrink-0 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group-hover:scale-[1.02] transition-transform duration-500 shadow-inner">
                            <img src={cleanUrl(test.image_url)} alt="Test" className="w-full h-full object-contain" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 leading-snug tracking-tight line-clamp-2 mb-3">{test.question}</p>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            {test.answers.map((answer, idx) => (
                              <div key={idx} className={`p-2 rounded-lg border flex items-start gap-2 transition-all h-full ${idx === test.correct_answer ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-50 opacity-60"}`}>
                                <div className={`flex-shrink-0 h-4 w-4 rounded-md flex items-center justify-center font-black text-[8px] ${idx === test.correct_answer ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                                  {idx + 1}
                                </div>
                                <span className={`text-[10px] font-bold leading-tight line-clamp-2 ${idx === test.correct_answer ? "text-emerald-700" : "text-slate-500"}`}>{answer}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 min-w-fit justify-end lg:justify-start pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-10 w-10 bg-slate-50 hover:bg-blue-50 text-slate-900 border border-slate-100 hover:border-blue-200 rounded-xl flex items-center justify-center p-0 transition-all shadow-sm"
                            onClick={() => handleEdit(test)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-10 w-10 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl flex items-center justify-center p-0 transition-all shadow-sm"
                            onClick={() => handleDelete(test.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
