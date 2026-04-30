"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ArrowLeft, BookOpen, Clock, Menu, PenTool, X, Check, FileQuestion, Home, CornerUpLeft, XCircle, Maximize2 } from "lucide-react"
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
  const [timeLeft, setTimeLeft] = useState(testType === "exam" && tests.length === 20 ? 25 * 60 : 0)
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

  const hasTimer = testType === "exam" && tests.length === 20

  useEffect(() => {
    if (!hasTimer || isFinished) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasTimer, isFinished])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return

      // Navigation
      if (e.key === "ArrowRight") {
        if (currentIndex < tests.length - 1) {
          setCurrentIndex(prev => prev + 1)
        }
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1)
        }
      }
      // Answer selection (1-5)
      else if (/^[1-5]$/.test(e.key)) {
        const optionIdx = parseInt(e.key) - 1
        if (optionIdx < displayAnswers.length && !isAnswered) {
          handleAnswerSelect(optionIdx)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, tests.length, isFinished, isAnswered, displayAnswers.length])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, "0")}`
  }

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
    const isPassed = results.unanswered === 0 && results.wrong <= Math.floor(tests.length * 0.1) // 90% pass logic

    return (
      <main className="min-h-screen bg-[#eef6fc] p-8 flex flex-col items-center pt-24 font-sans">

        {/* Title */}
        <h1 className="text-3xl font-medium text-black mb-4">TEST NATIJASI</h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-500 mb-8">Testlar soni: {tests.length}</p>

        {/* Stats */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#008000] w-6 h-6 flex items-center justify-center rounded-[3px]">
              <Check className="w-4 h-4 text-white stroke-[4]" />
            </div>
            <span className="text-[22px] text-black w-6">{results.correct}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-[22px] text-black w-6">{results.wrong}</span>
          </div>
        </div>

        {/* Passed/Failed Text */}
        <div className="min-h-[60px] flex items-center justify-center mb-6">
          {!isPassed && (
            <p className="text-red-600 text-[19px] text-center max-w-sm">
              Siz barcha savollarga javob bermadingiz va testdan o'tmadingiz
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-[340px]">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="w-full h-11 bg-transparent border-[#a3c9f1] hover:bg-blue-50 text-[#1875d1] rounded-[3px] flex items-center justify-center gap-3 text-[15px] font-normal"
          >
            <Home className="w-[18px] h-[18px]" />
            Bosh sahifaga
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full h-11 bg-transparent border-[#a3c9f1] hover:bg-blue-50 text-[#1875d1] rounded-[3px] flex items-center justify-center gap-3 text-[15px] font-normal"
          >
            <CornerUpLeft className="w-[18px] h-[18px]" />
            Boshqa test yechish
          </Button>
        </div>

      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f0f7f9] relative overflow-hidden flex flex-col font-sans">
      {/* Header Container */}
      <div className="w-full px-4 sm:px-8 pt-8 pb-4 bg-[#f0f7f9] flex flex-col gap-6 z-20">

        {/* Row 1: Logo */}
        <div className="flex w-full items-start">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-all shrink-0">
            <div className="relative w-32 h-8">
              <Image
                src="/images/logo.jpg"
                alt="Sarvar AvtoTest"
                fill
                className="object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Row 2: Numbers & Finish Button */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-between relative max-w-[1400px] mx-auto lg:px-4">

          {/* Spacer to keep numbers true center if needed on large screens, or just let them sit naturally */}
          <div className="hidden lg:block w-[140px]" />

          {/* Center: Numbers and Timer */}
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {hasTimer && (
              <div className="mr-4 font-bold text-lg tabular-nums text-slate-800">
                {formatTime(timeLeft)}
              </div>
            )}
            {tests.map((_, idx) => {
              const isActive = currentIndex === idx
              const isAns = answeredQuestions[idx]
              const correct = selectedAnswers[idx] === tests[idx].correct_answer

              let stateClass = "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              if (isActive) {
                stateClass = "bg-[#1875d1] text-white border-[#1875d1]"
              } else if (isAns) {
                stateClass = correct
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-red-500 text-white border-red-500"
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-[30px] h-[30px] flex items-center justify-center border text-[13px] font-normal transition-colors rounded-[2px] ${stateClass}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          {/* Right: Finish Button */}
          <div className="mt-4 lg:mt-0 shrink-0 flex items-center justify-end w-[140px]">
            {!isFinished ? (
              <Button
                suppressHydrationWarning
                onClick={handleFinish}
                className="px-4 h-9 bg-[#1875d1] hover:bg-[#1565c0] text-white rounded-[4px] font-normal text-sm"
              >
                <span suppressHydrationWarning>{t("test.finish", "Testni yakunlash")}</span>
              </Button>
            ) : (
              <div className="w-[140px]" />
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 flex-1 flex flex-col items-center pt-8">
        {/* Question Title */}
        <div className="w-full text-center space-y-4 mb-4">
          <h2 className="text-[22px] font-normal text-slate-800 tracking-wide max-w-5xl mx-auto">
            {displayQuestion}
          </h2>
          <div className="w-full h-px bg-slate-300 mt-6 mb-8 max-w-[1200px] mx-auto opacity-70" />
        </div>

        {/* Main Content: Side by Side */}
        <div className="w-full max-w-[1200px] flex flex-col items-center">
          <div className="w-full flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Left: Image Container */}
            <div className="w-full lg:w-5/12 flex justify-center lg:justify-end">
              <button
                onClick={() => currentTest.image_url && setIsImageModalOpen(true)}
                className="relative w-full max-w-[450px] bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-center overflow-hidden cursor-zoom-in hover:shadow-md transition-shadow"
              >
                {currentTest.image_url ? (
                  <img
                    src={getFixedImageUrl(currentTest.image_url)}
                    alt="Question"
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] flex items-center justify-center text-slate-100">
                    <BookOpen className="w-24 h-24" />
                  </div>
                )}
              </button>
            </div>

            {/* Right: Options */}
            <div className="w-full lg:w-7/12 flex flex-col gap-3">
              {displayAnswers.map((answer, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentTest.correct_answer
                const showFeedback = isAnswered

                // Default radio styling (matches screenshot)
                let containerClass = "bg-[#f8fdfb] border-[#27ae60]"
                let textClass = "text-slate-800"
                let radioBorder = "border-[#27ae60]"
                let radioInner = "bg-[#27ae60] opacity-0 scale-50"

                if (isSelected) {
                  radioInner = "bg-[#27ae60] opacity-100 scale-100"
                }

                if (showFeedback) {
                  if (isSelected) {
                    if (isCorrect) {
                      containerClass = "bg-green-50 border-green-500"
                      radioBorder = "border-green-600"
                      radioInner = "bg-green-600 opacity-100 scale-100"
                    } else {
                      containerClass = "bg-red-50 border-red-500"
                      radioBorder = "border-red-500"
                      radioInner = "bg-red-500 opacity-100 scale-100"
                    }
                  } else if (isCorrect) {
                    containerClass = "bg-green-50 border-green-500"
                    radioBorder = "border-green-600"
                    radioInner = "bg-green-600 opacity-100 scale-100"
                  } else {
                    containerClass = "bg-white border-slate-200 opacity-60"
                    radioBorder = "border-slate-300"
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => !isAnswered && handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={`flex items-center gap-4 w-full max-w-[600px] text-left rounded-[4px] border p-3.5 transition-all outline-none ${containerClass}`}
                  >
                    {/* Radio Button Circle */}
                    <div className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${radioBorder}`}>
                      <div className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${radioInner}`} />
                    </div>

                    {/* Answer Text */}
                    <div className={`flex-1 text-[15px] font-normal leading-snug ${textClass}`}>
                      {answer}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

        </div>

        {/* Navigation Actions */}
        <div className="pt-12 flex justify-center w-full pb-20">
          {currentIndex < tests.length - 1 ? (
            <Button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="px-8 h-10 bg-[#1875d1] hover:bg-[#1565c0] text-white rounded-[4px] font-normal text-sm"
            >
              <span suppressHydrationWarning>{t("common.next", "Keyingisi")}</span>
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              className="px-8 h-10 bg-green-600 hover:bg-green-700 text-white rounded-[4px] font-normal text-sm"
            >
              <span suppressHydrationWarning>{t("nav.results", "Natijalarni ko'rish")}</span>
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
    </main >
  )
}
