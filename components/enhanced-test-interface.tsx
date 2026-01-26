"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, Volume2, Lightbulb, BookOpen, ArrowLeft } from "lucide-react"
import Image from "next/image"
import type { Test, UserSettings } from "@/lib/types"
import { useTranslation } from "react-i18next"
import { QuizProtection } from "@/components/quiz-protection"
import { LanguageSwitcher } from "@/components/language-switcher"

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
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({})
  const [playingAudio, setPlayingAudio] = useState<Record<number, boolean>>({})
  const [isMounted, setIsMounted] = useState(false)
  const audioRefs = useRef<Record<number, HTMLAudioElement>>({})
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  // We rely on i18next for language, but we can verify consistency if needed.
  // The userSettings language should ideally ideally match i18n.language, but i18next is the source of truth for UI.
  const questionFontSize = userSettings?.question_font_size || 16
  const answerFontSize = userSettings?.answer_font_size || 14

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reset audio when question changes
  useEffect(() => {
    // Stop any playing audio
    const currentAudio = Object.values(audioRefs.current).find(audio => !audio.paused);
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setPlayingAudio({});

    // Auto-scroll to top if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex]);

  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isFinished) return

      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else if (e.key === "ArrowRight" && currentIndex < tests.length - 1) {
        // Allow navigation regardless of answer status
        setCurrentIndex(currentIndex + 1)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current)
    }
  }, [currentIndex, tests.length, isFinished])

  const handleAnswerSelect = (answerIndex: number) => {
    if (answeredQuestions[currentIndex]) return

    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: answerIndex })
    setAnsweredQuestions({ ...answeredQuestions, [currentIndex]: true })

    // Auto-advance logic
    if (currentIndex < tests.length - 1) {
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current)
      autoNextTimeoutRef.current = setTimeout(() => {
        setCurrentIndex(prev => prev + 1)
      }, 1500)
    }
  }

  const handleFinish = async () => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current)
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

  const saveTopicStatistics = async (
    topicId: string,
    correct: number,
    wrong: number,
    unanswered: number,
    percentage: number
  ) => {
    const { data: existing } = await supabase
      .from("topic_statistics")
      .select("*")
      .eq("user_id", userId)
      .eq("topic_id", topicId)
      .single()

    if (existing) {
      await supabase
        .from("topic_statistics")
        .update({
          correct_count: correct,
          wrong_count: wrong,
          unanswered_count: unanswered,
          percentage,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    } else {
      await supabase.from("topic_statistics").insert({
        user_id: userId,
        topic_id: topicId,
        correct_count: correct,
        wrong_count: wrong,
        unanswered_count: unanswered,
        percentage,
      })
    }
  }

  const saveTicketStatistics = async (
    ticketId: string,
    correct: number,
    wrong: number,
    unanswered: number,
    percentage: number
  ) => {
    const { data: existing } = await supabase
      .from("ticket_statistics")
      .select("*")
      .eq("user_id", userId)
      .eq("ticket_id", ticketId)
      .single()

    if (existing) {
      await supabase
        .from("ticket_statistics")
        .update({
          correct_count: correct,
          wrong_count: wrong,
          unanswered_count: unanswered,
          percentage,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    } else {
      await supabase.from("ticket_statistics").insert({
        user_id: userId,
        ticket_id: ticketId,
        correct_count: correct,
        wrong_count: wrong,
        unanswered_count: unanswered,
        percentage,
      })
    }
  }

  const saveExamStatistics = async (
    examType: 20 | 50 | 100,
    correct: number,
    wrong: number,
    unanswered: number,
    percentage: number
  ) => {
    const { data: existing } = await supabase
      .from("exam_statistics")
      .select("*")
      .eq("user_id", userId)
      .eq("exam_type", examType)
      .single()

    if (existing) {
      await supabase
        .from("exam_statistics")
        .update({
          correct_count: correct,
          wrong_count: wrong,
          unanswered_count: unanswered,
          percentage,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    } else {
      await supabase.from("exam_statistics").insert({
        user_id: userId,
        exam_type: examType,
        correct_count: correct,
        wrong_count: wrong,
        unanswered_count: unanswered,
        percentage,
      })
    }
  }

  const toggleAudio = (index: number) => {
    if (!audioRefs.current[index] && tests[index].audio_url) {
      const audio = new Audio(tests[index].audio_url!)
      audioRefs.current[index] = audio
      audio.onended = () => setPlayingAudio({ ...playingAudio, [index]: false })
    }

    const audio = audioRefs.current[index]
    if (audio) {
      if (playingAudio[index]) {
        audio.pause()
        audio.currentTime = 0
        setPlayingAudio({ ...playingAudio, [index]: false })
      } else {
        audio.play()
        setPlayingAudio({ ...playingAudio, [index]: true })
      }
    }
  }

  const toggleExplanation = (index: number) => {
    setShowExplanation({ ...showExplanation, [index]: !showExplanation[index] })
  }

  if (isFinished && results) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{t("test.finished")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{results.score}%</div>
              <div className="text-muted-foreground">{t("test.finalScore")}</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border bg-card p-4 text-center">
                <div className="text-2xl font-bold">{tests.length}</div>
                <div className="text-sm text-muted-foreground">{t("test.totalQuestions")}</div>
              </div>
              <div className="rounded-lg border bg-success/10 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-success">
                  <CheckCircle2 className="h-6 w-6" />
                  {results.correct}
                </div>
                <div className="text-sm text-muted-foreground">{t("test.correct")}</div>
              </div>
              <div className="rounded-lg border bg-destructive/10 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-destructive">
                  <XCircle className="h-6 w-6" />
                  {results.wrong}
                </div>
                <div className="text-sm text-muted-foreground">{t("test.wrong")}</div>
              </div>
              <div className="rounded-lg border bg-muted/10 p-4 text-center">
                <div className="text-2xl font-bold">{results.unanswered}</div>
                <div className="text-sm text-muted-foreground">{t("test.unanswered")}</div>
              </div>
            </div>

            <Button onClick={() => router.push("/dashboard")} className="w-full">
              {t("test.backToDashboard")}
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!isMounted) {
    return <main className="min-h-screen bg-[#e0f2fe]" />
  }

  const currentTest = tests[currentIndex]
  const isCyrillic = i18n.language === 'uz_cyrl'

  // Dynamic content based on language
  const displayQuestion = (isCyrillic && currentTest.question_cyrl) ? currentTest.question_cyrl : currentTest.question
  const displayAnswers = (isCyrillic && currentTest.answers_cyrl) ? currentTest.answers_cyrl : currentTest.answers
  const displayExplanationTitle = (isCyrillic && currentTest.explanation_title_cyrl) ? currentTest.explanation_title_cyrl : currentTest.explanation_title
  const displayExplanationText = (isCyrillic && currentTest.explanation_text_cyrl) ? currentTest.explanation_text_cyrl : currentTest.explanation_text
  const displayAudioUrl = (isCyrillic && currentTest.audio_url_cyrl) ? currentTest.audio_url_cyrl : currentTest.audio_url

  const selectedAnswer = selectedAnswers[currentIndex]
  const isAnswered = answeredQuestions[currentIndex]

  const getFLabel = (index: number) => `F${index + 1}`

  return (
    <main className="min-h-screen bg-[#e0f2fe] py-6 md:py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hover:bg-white/50 text-[#0369a1]" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Orqaga
            </Button>
            <h1 className="text-2xl font-bold text-[#0369a1]">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="outline" onClick={handleFinish} className="bg-white/50 hover:bg-white border-red-200 text-red-600">
              {t("test.finish")}
            </Button>
          </div>
        </div>

        {/* Top Navigation Strip (Test Numbers) */}
        <div className="mb-6 bg-white border border-zinc-200 p-4 rounded-xl shadow-sm overflow-x-auto">
          <div className="flex flex-wrap justify-center gap-2 min-w-max">
            {tests.map((_, idx) => {
              const ansIdx = selectedAnswers[idx]
              const isAns = answeredQuestions[idx]
              const correct = ansIdx === tests[idx].correct_answer

              let btnClass = "bg-gray-200 text-gray-600"
              if (currentIndex === idx) btnClass = "ring-2 ring-primary ring-offset-2 bg-primary text-white"
              else if (isAns) {
                btnClass = correct ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`
                    h-8 w-10 md:h-9 md:w-12 rounded flex items-center justify-center text-xs md:text-sm font-bold
                    ${btnClass}
                  `}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>

        <Card className="bg-white border-zinc-200 shadow-sm overflow-hidden rounded-2xl">
          <QuizProtection>
            <CardContent className="p-6 md:p-8">
              {/* Question Header - Now at the Top */}
              <div className="mb-6 border-b border-gray-100 pb-6 text-center">
                <h2 className="font-bold leading-snug text-gray-800 break-words" style={{ fontSize: `${questionFontSize}px` }}>
                  {displayQuestion}
                </h2>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Side: Question Image */}
                <div className="lg:w-5/12 flex items-center justify-center">
                  <div className="relative w-full aspect-video md:aspect-[4/3] max-w-[500px] overflow-hidden rounded-xl bg-gray-50 border border-zinc-100 flex items-center justify-center shadow-inner">
                    {currentTest.image_url ? (
                      <Image
                        src={currentTest.image_url}
                        alt="Question"
                        fill
                        className="object-contain"
                        priority
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-gray-300">
                        <BookOpen className="h-16 w-16" />
                        <span className="text-sm">Rasm yo'q</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Answers & Navigation */}
                <div className="lg:w-7/12 flex flex-col justify-between space-y-8">
                  <div className="space-y-4">
                    <RadioGroup
                      key={currentIndex}
                      value={selectedAnswer?.toString()}
                      onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
                      className="space-y-3"
                    >
                      {displayAnswers.map((answer, index) => {
                        const isSelected = selectedAnswer === index
                        const isCorrect = index === currentTest.correct_answer
                        const showFeedback = isAnswered

                        let containerClass = "bg-gray-50/50 border-gray-200"
                        let labelBg = "bg-gray-400"
                        let labelText = "text-white"

                        if (isSelected) {
                          containerClass = "bg-blue-50 border-blue-500 shadow-sm"
                          labelBg = "bg-blue-600"
                        }

                        if (showFeedback) {
                          if (isSelected) {
                            if (!isCorrect) {
                              containerClass = "bg-red-50 border-red-500 shadow-sm"
                              labelBg = "bg-red-600"
                            } else {
                              containerClass = "bg-green-50 border-green-500 shadow-sm"
                              labelBg = "bg-green-600"
                            }
                          } else if (isCorrect) {
                            containerClass = "bg-green-50 border-green-500/50"
                            labelBg = "bg-green-600"
                          } else {
                            containerClass = "opacity-50 grayscale"
                          }
                        }

                        return (
                          <div
                            key={index}
                            onClick={() => !isAnswered && handleAnswerSelect(index)}
                            className={`
                              flex items-center gap-0 rounded-xl border-2 cursor-pointer overflow-hidden transition-all duration-200
                              ${containerClass}
                            `}
                          >
                            <RadioGroupItem
                              value={index.toString()}
                              id={`answer-${index}`}
                              disabled={isAnswered}
                              className="sr-only"
                            />
                            {/* F Label Box */}
                            <div className={`
                              flex-shrink-0 w-12 h-full py-4 flex items-center justify-center font-bold text-sm
                              ${labelBg} ${labelText}
                            `}>
                              {getFLabel(index)}
                            </div>
                            {/* Answer Text */}
                            <Label
                              htmlFor={`answer-${index}`}
                              className="flex-1 cursor-pointer font-medium px-5 py-4 leading-tight text-gray-700"
                              style={{ fontSize: `${answerFontSize}px` }}
                            >
                              {answer}
                            </Label>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 pt-6 mt-auto">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentIndex(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className="flex-1 h-12 text-sm rounded-xl font-semibold border-zinc-200 hover:bg-zinc-50"
                    >
                      Avvalgi
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                      disabled={currentIndex === tests.length - 1}
                      className="flex-1 h-12 text-sm rounded-xl font-semibold border-zinc-200 hover:bg-zinc-50"
                    >
                      Keyingi
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </QuizProtection>
        </Card>
      </div>
    </main>
  )
}
