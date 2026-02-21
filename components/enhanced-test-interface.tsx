"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Timer } from "@/components/timer"
import { BookOpen, CheckCircle2, XCircle, ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { Test, UserSettings } from "@/lib/types"

interface EnhancedTestInterfaceProps {
  title: string
  tests: Test[]
  userId: string
  testType?: "topic" | "ticket" | "exam" | "random"
  testTypeId?: string
  userSettings?: UserSettings | null
}

export function EnhancedTestInterface({
  title,
  tests,
  userId,
  testType = "topic",
  testTypeId,
  userSettings,
}: EnhancedTestInterfaceProps) {
  const { t, i18n } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, boolean>>({})
  const [isFinished, setIsFinished] = useState(false)
  const [results, setResults] = useState<{ correct: number; wrong: number; unanswered: number; score: number } | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const currentTest = tests[currentIndex]
  const isCyrillic = i18n.language === 'uz_cyrl'

  const displayQuestion = (isCyrillic && currentTest.question_cyrl) ? currentTest.question_cyrl : currentTest.question
  const displayAnswers = (isCyrillic && currentTest.answers_cyrl) ? currentTest.answers_cyrl : currentTest.answers

  const selectedAnswer = selectedAnswers[currentIndex]
  const isAnswered = answeredQuestions[currentIndex]

  const hasTimer = tests.length === 20

  const handleAnswerSelect = (answerIndex: number) => {
    if (answeredQuestions[currentIndex]) return

    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: answerIndex })
    setAnsweredQuestions({ ...answeredQuestions, [currentIndex]: true })

    if (currentIndex < tests.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
      }, 1000)
    }
  }

  const handleFinish = async () => {
    setIsFinished(true)

    let correct = 0
    let wrong = 0
    let unanswered = 0

    tests.forEach((test, index) => {
      const selectedAnswer = selectedAnswers[index]
      if (selectedAnswer === undefined) {
        unanswered++
      } else if (selectedAnswer === test.correct_answer) {
        correct++
      } else {
        wrong++
      }
    })

    const total = tests.length
    const score = total > 0 ? Math.round((correct / total) * 100) : 0
    setResults({ correct, wrong, unanswered, score })

    if (testType === "topic" && testTypeId) {
      await saveTopicStatistics(testTypeId, correct, wrong, unanswered, score)
    } else if (testType === "ticket" && testTypeId) {
      await saveTicketStatistics(testTypeId, correct, wrong, unanswered, score)
    } else if (testType === "exam" && testTypeId) {
      const examType = Number.parseInt(testTypeId) as 20 | 50 | 100
      await saveExamStatistics(examType, correct, wrong, unanswered, score)
    }
  }

  const saveTopicStatistics = async (topicId: string, correct: number, wrong: number, unanswered: number, percentage: number) => {
    const { data: existing } = await supabase
      .from("topic_statistics")
      .select("*")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .single()

    if (existing) {
      await supabase
        .from("topic_statistics")
        .update({ correct_count: correct, wrong_count: wrong, unanswered_count: unanswered, percentage, last_attempt_at: new Date().toISOString() })
        .eq("id", existing.id)
    } else {
      await supabase.from("topic_statistics").insert({ user_id: userId, topic_id: topicId, correct_count: correct, wrong_count: wrong, unanswered_count: unanswered, percentage })
    }
  }

  const saveTicketStatistics = async (ticketId: string, correct: number, wrong: number, unanswered: number, percentage: number) => {
    const { data: existing } = await supabase
      .from("ticket_statistics")
      .select("*")
      .eq("user_id", userId)
      .eq("ticket_id", ticketId)
      .single()

    if (existing) {
      await supabase
        .from("ticket_statistics")
        .update({ correct_count: correct, wrong_count: wrong, unanswered_count: unanswered, percentage, last_attempt_at: new Date().toISOString() })
        .eq("id", existing.id)
    } else {
      await supabase.from("ticket_statistics").insert({ user_id: userId, ticket_id: ticketId, correct_count: correct, wrong_count: wrong, unanswered_count: unanswered, percentage })
    }
  }

  const saveExamStatistics = async (examType: 20 | 50 | 100, correct: number, wrong: number, unanswered: number, percentage: number) => {
    const { data: existing } = await supabase
      .from("exam_statistics")
      .select("*")
      .eq("user_id", userId)
      .eq("exam_type", examType)
      .single()

    if (existing) {
      await supabase
        .from("exam_statistics")
        .update({ correct_count: correct, wrong_count: wrong, unanswered_count: unanswered, percentage, last_attempt_at: new Date().toISOString() })
        .eq("id", existing.id)
    } else {
      await supabase.from("exam_statistics").insert({ user_id: userId, exam_type: examType, correct_count: correct, wrong_count: wrong, unanswered_count: unanswered, percentage })
    }
  }

  if (isFinished && results) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 relative overflow-hidden flex items-center justify-center">
        {/* Background Blobs */}
        <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-primary/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob" />
        <div className="absolute bottom-0 -right-20 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-10 animate-blob animation-delay-2000" />

        <Card className="max-w-3xl w-full mx-auto p-12 glass-dark border-white/5 rounded-[3rem] shadow-3xl relative z-10">
          <div className="text-center space-y-10">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tight">{t("test.finished")}</h2>
              <p className="text-slate-400 font-bold text-lg">Test natijalari</p>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="text-8xl md:text-9xl font-black text-primary tracking-tighter mb-2 animate-bounce-subtle">{results.score}%</div>
              <div className="text-slate-300 font-black uppercase tracking-widest text-sm">{t("test.finalScore")}</div>
            </div>

            <div className="grid gap-6 grid-cols-2 md:grid-cols-4 pt-10">
              <div className="rounded-3xl border border-white/5 bg-white/5 p-6 text-center group hover:bg-white/10 transition-all">
                <div className="text-3xl font-black text-white">{tests.length}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{t("test.totalQuestions")}</div>
              </div>
              <div className="rounded-3xl border border-success/10 bg-success/5 p-6 text-center group hover:bg-success/10 transition-all">
                <div className="flex items-center justify-center gap-2 text-3xl font-black text-success">
                  {results.correct}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{t("test.correct")}</div>
              </div>
              <div className="rounded-3xl border border-destructive/10 bg-destructive/5 p-6 text-center group hover:bg-destructive/10 transition-all">
                <div className="flex items-center justify-center gap-2 text-3xl font-black text-destructive">
                  {results.wrong}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{t("test.wrong")}</div>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/5 p-6 text-center group hover:bg-white/10 transition-all">
                <div className="text-3xl font-black text-slate-300">{results.unanswered}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{t("test.unanswered")}</div>
              </div>
            </div>

            <div className="pt-10">
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {t("test.backToDashboard")}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-20 w-[40rem] h-[40rem] bg-primary/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-5 animate-blob" />
      <div className="absolute bottom-0 -right-20 w-[30rem] h-[30rem] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-5 animate-blob animation-delay-2000" />

      {/* Header - Glassmorphism */}
      <div className="relative z-20 px-4 pt-4">
        <div className="container mx-auto flex h-20 items-center justify-between px-8 rounded-2xl glass-dark border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/20 rounded-xl">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="text-left font-black text-white">
              <div className="text-xl leading-none tracking-tight">Tezkor</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest">Avtotest</div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {hasTimer && (
              <div className="bg-white/5 px-6 py-2 rounded-xl border border-white/10">
                <Timer durationSeconds={1500} onTimeUp={handleFinish} />
              </div>
            )}
            <Button
              onClick={handleFinish}
              variant="outline"
              className="h-12 px-8 border-white/10 bg-white/5 text-white hover:bg-destructive hover:text-white hover:border-destructive transition-all rounded-xl font-bold"
            >
              Testni yakunlash
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl relative z-10 flex-1 flex flex-col">
        {/* Navigation - Glassy Track */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-12 pb-4 pt-2">
          {tests.map((_, idx) => {
            const isActive = currentIndex === idx
            const isAns = answeredQuestions[idx]
            const correct = selectedAnswers[idx] === tests[idx].correct_answer

            let baseClass = "min-w-[54px] h-14 flex items-center justify-center border-2 border-white/5 rounded-2xl text-xl font-black transition-all"
            let stateClass = "bg-white/5 text-slate-500 hover:bg-white/10"

            if (isActive) {
              stateClass = "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110 relative z-10"
            } else if (isAns) {
              stateClass = correct
                ? "bg-success/20 text-success border-success/30"
                : "bg-destructive/20 text-destructive border-destructive/30"
            }

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`${baseClass} ${stateClass}`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>

        {/* Question Area */}
        <div className="space-y-12 flex-1">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <span className="text-primary font-black uppercase tracking-[0.3em] text-xs">Savol {currentIndex + 1} / {tests.length}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {displayQuestion}
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-start justify-center pb-12">
            {/* Image Section */}
            <div className="w-full lg:w-1/2 flex justify-center sticky top-28">
              <div className="relative w-full aspect-video rounded-[2.5rem] glass-dark border border-white/10 overflow-hidden shadow-2xl p-4 transition-transform duration-500 group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl" />
                {currentTest.image_url ? (
                  <Image
                    src={currentTest.image_url}
                    alt="Question"
                    fill
                    className="object-contain p-6 relative z-10"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-800">
                    <BookOpen className="w-32 h-32 opacity-10" />
                  </div>
                )}
              </div>
            </div>

            {/* Options Section */}
            <div className="w-full lg:w-1/2 space-y-6">
              {displayAnswers.map((answer, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentTest.correct_answer
                const showFeedback = isAnswered

                let baseClass = "w-full p-8 flex items-center gap-6 rounded-3xl border border-white/5 glass-dark transition-all duration-300 text-left font-bold text-xl group relative overflow-hidden"
                let stateClass = "text-slate-300 border-none bg-white/5 hover:bg-white/10"

                if (isSelected) {
                  stateClass = "bg-primary/10 border-primary/40 text-primary shadow-xl shadow-primary/10"
                }

                if (showFeedback) {
                  if (isSelected) {
                    stateClass = isCorrect
                      ? "bg-success/10 border-success/40 text-success shadow-success/10"
                      : "bg-destructive/10 border-destructive/40 text-destructive shadow-destructive/10"
                  } else if (isCorrect) {
                    stateClass = "bg-success/10 border-success/40 text-success shadow-success/10"
                  } else {
                    stateClass = "opacity-50 grayscale scale-[0.98] border-none bg-white/5"
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => !isAnswered && handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={`${baseClass} ${stateClass} ${!isAnswered ? "hover:scale-[1.02] active:scale-[0.98]" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${isSelected
                        ? "border-primary bg-primary text-white"
                        : showFeedback && isCorrect
                          ? "border-success bg-success text-white"
                          : "border-slate-500 group-hover:border-slate-300"
                      }`}>
                      {isSelected ? "✓" : index + 1}
                    </div>
                    <span className="relative z-10">{answer}</span>
                  </button>
                )
              })}

              {/* Navigation Actions */}
              {isAnswered && (
                <div className="pt-8 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {currentIndex < tests.length - 1 ? (
                    <Button
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                      className="w-full h-20 bg-primary hover:bg-primary/90 text-white text-2xl font-black rounded-3xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-[0.97]"
                    >
                      Keyingisi →
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinish}
                      className="w-full h-20 bg-success hover:bg-success/90 text-white text-2xl font-black rounded-3xl shadow-xl shadow-success/20 transition-all hover:scale-[1.03] active:scale-[0.97]"
                    >
                      Yakunlash ✓
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
