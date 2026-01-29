"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react"
import Image from "next/image"
import type { Test, UserSettings } from "@/lib/types"
import { useTranslation } from "react-i18next"
import { Timer } from "@/components/timer"

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
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">{t("test.finished")}</h2>

            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{results.score}%</div>
              <div className="text-gray-600">{t("test.finalScore")}</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{tests.length}</div>
                <div className="text-sm text-gray-600">{t("test.totalQuestions")}</div>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                  {results.correct}
                </div>
                <div className="text-sm text-gray-600">{t("test.correct")}</div>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-red-600">
                  <XCircle className="h-6 w-6" />
                  {results.wrong}
                </div>
                <div className="text-sm text-gray-600">{t("test.wrong")}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{results.unanswered}</div>
                <div className="text-sm text-gray-600">{t("test.unanswered")}</div>
              </div>
            </div>

            <Button onClick={() => router.push("/dashboard")} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl">
              {t("test.backToDashboard")}
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-20 border-b border-gray-200">
        <Button variant="ghost" onClick={() => router.back()} className="text-gray-600">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Orqaga
        </Button>
        <div className="flex items-center gap-3">
          {hasTimer && (
            <Timer durationSeconds={1500} onTimeUp={handleFinish} />
          )}
          <Button onClick={handleFinish} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-6">
            Testni yakunlash
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Navigation Strip */}
        <div className="bg-background p-2 rounded-lg shadow-sm mb-6 overflow-x-auto border border-gray-200">
          <div className="flex gap-1 min-w-max">
            {tests.map((_, idx) => {
              const isActive = currentIndex === idx
              const isAns = answeredQuestions[idx]
              const correct = selectedAnswers[idx] === tests[idx].correct_answer

              let bg = "bg-background text-gray-700 hover:bg-gray-50 border border-gray-200"
              if (isActive) bg = "bg-primary text-white border-primary"
              else if (isAns) bg = correct ? "bg-success text-white border-success" : "bg-destructive text-white border-destructive"

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 flex items-center justify-center rounded text-sm font-semibold transition-colors ${bg}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-background rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-8">
            {displayQuestion}
          </h2>

          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Image */}
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                {currentTest.image_url && (
                  <Image src={currentTest.image_url} alt="Question" fill className="object-contain" />
                )}
              </div>
            </div>

            {/* Answers */}
            <div className="w-full lg:w-1/2 flex flex-col gap-3">
              {displayAnswers.map((answer, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentTest.correct_answer
                const showFeedback = isAnswered

                let containerClass = "border border-gray-300 bg-white hover:bg-gray-50"
                let circleClass = "border-2 border-gray-300"

                if (isSelected) {
                  containerClass = "border-2 border-primary bg-primary/5"
                  circleClass = "border-primary bg-primary"
                }

                if (showFeedback) {
                  if (isSelected) {
                    if (isCorrect) {
                      containerClass = "border-2 border-success bg-success/5"
                      circleClass = "border-success bg-success"
                    } else {
                      containerClass = "border-2 border-destructive bg-destructive/5"
                      circleClass = "border-destructive bg-destructive"
                    }
                  } else if (isCorrect) {
                    containerClass = "border-2 border-success bg-success/5"
                    circleClass = "border-success bg-success"
                  }
                }

                return (
                  <div
                    key={index}
                    onClick={() => !isAnswered && handleAnswerSelect(index)}
                    className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${containerClass}`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${circleClass}`}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-lg text-gray-800 font-medium">{answer}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Next Button */}
          <div className="mt-10 flex justify-center">
            <Button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              disabled={currentIndex === tests.length - 1}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-12 py-6 rounded-xl shadow-lg shadow-primary/20"
            >
              Keyingisi
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
