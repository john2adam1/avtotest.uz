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
import { BookOpen, CheckCircle2, XCircle, ArrowLeft, Maximize2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { Test, UserSettings } from "@/lib/types"
import { ImageModal } from "@/components/image-modal"

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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  // Helper to fix PostImage viewer links to direct links
  const getFixedImageUrl = (url: string) => {
    if (!url) return url
    // If it's a postimg.cc viewer link (not starting with i.), try to convert it
    if (url.includes("postimg.cc") && !url.includes("i.postimg.cc")) {
      // https://postimg.cc/Dmfk0bYv -> https://i.postimg.cc/Dmfk0bYv/image.png
      // This is a common pattern, though not 100% guaranteed, it's better than a broken page
      return url.replace("postimg.cc/", "i.postimg.cc/") + "/image.png"
    }
    return url
  }

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
      <main className="min-h-screen bg-[#e9f6ff] px-4 py-8 relative overflow-hidden flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto p-12 bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-blue-500/5 relative z-10">
          <div className="text-center space-y-10">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">{t("test.finished")}</h2>
              <p className="text-slate-500 font-bold text-lg">{t("test.finalScore")}</p>
            </div>

            <div className="relative group">
              <div className="text-6xl md:text-9xl font-black text-blue-600 tracking-tighter mb-2 italic">{results.score}%</div>
              <div className="text-slate-400 font-black uppercase tracking-widest text-sm">{t("test.finalScore")}</div>
            </div>

            <div className="grid gap-4 grid-cols-2 pt-6">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-center">
                <div className="text-3xl font-black text-slate-900 italic">{tests.length}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t("test.totalQuestions")}</div>
              </div>
              <div className="rounded-3xl border border-green-100 bg-green-50 p-6 text-center">
                <div className="text-3xl font-black text-green-600 italic">{results.correct}</div>
                <div className="text-[10px] font-black text-green-600/50 uppercase tracking-widest mt-1">{t("test.correct")}</div>
              </div>
              <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
                <div className="text-3xl font-black text-red-600 italic">{results.wrong}</div>
                <div className="text-[10px] font-black text-red-600/50 uppercase tracking-widest mt-1">{t("test.wrong")}</div>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 text-center">
                <div className="text-3xl font-black text-slate-400 italic">{results.unanswered}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t("test.unanswered")}</div>
              </div>
            </div>

            <div className="pt-8">
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-lg rounded-2xl shadow-lg shadow-blue-500/20 transition-all uppercase tracking-wide sm:tracking-widest italic"
              >
                {t("test.backToDashboard")}
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#e9f6ff] relative overflow-hidden flex flex-col font-sans pt-10">
      {/* Row 1: Logo + Finish Button */}
      <div className="w-full px-3 sm:px-8 py-3 sm:py-4 z-20 flex items-center justify-between gap-2">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-all shrink-0">
          <div className="text-blue-700 font-black">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 10V15H15V35H25V15H35V10H5Z" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Sarvar</span>
            <span className="text-sm font-bold text-slate-800 tracking-tight uppercase leading-none">AvtoTest</span>
          </div>
        </Link>

        {/* Language Switcher */}
        {!isFinished && (
          <div className="flex bg-white/50 backdrop-blur-sm border border-white/40 p-1 rounded-2xl shadow-xl shadow-blue-500/5">
            <button
              onClick={() => i18n.changeLanguage('uz')}
              className={`px-2 sm:px-6 py-1.5 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i18n.language === 'uz'
                ? 'bg-[#0969DA] text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-500 hover:text-[#0969DA] hover:bg-white/80'
                }`}
            >
              <span className="hidden sm:inline">Uzbek-latin</span>
              <span className="sm:hidden">Lotin</span>
            </button>
            <button
              onClick={() => i18n.changeLanguage('uz_cyrl')}
              className={`px-2 sm:px-6 py-1.5 sm:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i18n.language === 'uz_cyrl'
                ? 'bg-[#0969DA] text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-500 hover:text-[#0969DA] hover:bg-white/80'
                }`}
            >
              <span className="hidden sm:inline">Uzbek-cyrillic</span>
              <span className="sm:hidden">Кирил</span>
            </button>
          </div>
        )}

        {!isFinished && (
          <Button
            onClick={handleFinish}
            className="h-10 sm:h-12 px-3 sm:px-8 bg-[#0969DA] hover:bg-[#085dc2] text-white rounded-2xl font-black text-xs sm:text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95 uppercase tracking-normal sm:tracking-widest italic shrink-0"
          >
            <span className="hidden sm:inline">{t("test.finish", "Yakunlash")}</span>
            <span className="sm:hidden">✓ {t("test.finish", "Yakunlash")}</span>
          </Button>
        )}
      </div>

      {/* Row 2: Navigation (Numbers) */}
      <div className="w-full px-2 sm:px-8 flex items-center justify-center relative z-20 mb-6 sm:mb-12">
        <div className="flex flex-wrap items-center justify-center gap-2.5 p-4 bg-white/40 backdrop-blur-sm border border-white/20 rounded-[2.5rem] shadow-xl shadow-blue-500/5 max-w-5xl mx-auto">
          {tests.map((_, idx) => {
            const isActive = currentIndex === idx
            const isAns = answeredQuestions[idx]
            const correct = selectedAnswers[idx] === tests[idx].correct_answer

            let stateClass = "bg-white text-slate-500 border-slate-200 hover:bg-white hover:border-blue-400 shadow-sm"
            if (isActive) {
              stateClass = "bg-[#0969DA] text-white border-[#0969DA] shadow-lg shadow-blue-500/20 scale-110 z-10"
            } else if (isAns) {
              stateClass = correct
                ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/10"
                : "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/10"
            }

            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 text-sm font-black transition-all duration-200 ${stateClass}`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-7xl flex-1 flex flex-col items-center">
        {/* Question Title */}
        <div className="w-full text-center space-y-4 mb-2">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight max-w-4xl mx-auto leading-relaxed">
            {displayQuestion}
          </h2>
          <div className="w-full h-px bg-slate-300 mt-6 mb-10 max-w-6xl mx-auto opacity-40" />
        </div>

        {/* Main Content: Side by Side */}
        <div className="w-full max-w-6xl flex flex-col items-center">
          <div className="w-full flex flex-col lg:flex-row gap-12 items-start justify-center py-4">
            {/* Left: Image Container */}
            <div className="w-full lg:w-5/12 flex justify-center">
              <button
                onClick={() => currentTest.image_url && setIsImageModalOpen(true)}
                className="relative w-full aspect-[4/3] rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-blue-500/5 p-8 flex items-center justify-center overflow-hidden group/img cursor-zoom-in transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {currentTest.image_url ? (
                  <>
                    <img
                      src={getFixedImageUrl(currentTest.image_url)}
                      alt="Question"
                      className="max-w-full max-h-full object-contain"
                    />
                    <div className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-sm rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <Maximize2 className="w-5 h-5 text-blue-600" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-50">
                    <BookOpen className="w-40 h-40" />
                  </div>
                )}
              </button>
            </div>

            {/* Right: Options */}
            <div className="w-full lg:w-6/12 flex flex-col gap-4">
              {displayAnswers.map((answer, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentTest.correct_answer
                const showFeedback = isAnswered

                // Matching mockup's green borders and F1 badges
                let stateClass = "bg-white border-[#27ae60]/30 text-slate-700 hover:border-[#27ae60]"
                let keyBadgeClass = "bg-white border-[#27ae60] text-[#27ae60]"

                if (isSelected) {
                  stateClass = "bg-[#27ae60]/5 border-[#27ae60] text-[#1e8449] shadow-sm"
                  keyBadgeClass = "bg-[#27ae60] border-[#27ae60] text-white"
                }

                if (showFeedback) {
                  if (isSelected) {
                    stateClass = isCorrect
                      ? "bg-green-100 border-green-600 text-green-900"
                      : "bg-red-50 border-red-500 text-red-800"
                    keyBadgeClass = isCorrect
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-red-600 border-red-600 text-white"
                  } else if (isCorrect) {
                    stateClass = "bg-green-50 border-green-500 text-green-800"
                    keyBadgeClass = "bg-green-600 border-green-600 text-white"
                  } else {
                    stateClass = "opacity-50 border-slate-100 text-slate-300 pointer-events-none"
                    keyBadgeClass = "bg-white border-slate-200 text-slate-200"
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => !isAnswered && handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={`group flex items-center gap-4 w-full text-left transition-all ${!isAnswered ? "hover:translate-x-1" : ""}`}
                  >
                    {/* F1, F2, F3 Badge - Mockup style: Roundish or badge */}
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-sm transition-all shadow-sm ${keyBadgeClass}`}>
                      F{index + 1}
                    </div>

                    {/* Answer Box */}
                    <div className={`flex-1 p-4 rounded-xl border-2 transition-all font-bold text-lg leading-snug shadow-sm ${stateClass}`}>
                      {answer}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* Navigation Actions - Centered below, always visible like in mockup */}
        <div className="pt-10 flex justify-center w-full pb-20">
          {currentIndex < tests.length - 1 ? (
            <Button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="h-12 sm:h-14 px-10 sm:px-20 bg-[#0969DA] hover:bg-[#085dc2] text-white font-black text-base sm:text-xl rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest active:scale-95"
            >
              {t("common.next", "Keyingisi")}
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              className="h-12 sm:h-14 px-10 sm:px-20 bg-green-500 hover:bg-green-600 text-white font-black text-base sm:text-xl rounded-2xl shadow-xl shadow-green-500/20 transition-all uppercase tracking-widest active:scale-95"
            >
              {t("nav.results", "Natijalarni ko'rish")}
            </Button>
          )}
        </div>
      </div>

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={getFixedImageUrl(currentTest.image_url || "")}
        altText={displayQuestion}
      />
    </main>
  )
}
