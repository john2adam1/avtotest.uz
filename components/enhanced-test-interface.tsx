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
import { ImageModal } from "@/components/image-modal"
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
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({})
  const [playingAudio, setPlayingAudio] = useState<Record<number, boolean>>({})
  const [isMounted, setIsMounted] = useState(false)
  const [modalImage, setModalImage] = useState<string | null>(null)
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
  const isExam = testType === "exam"
  // Actually logic: 20 questions = 25 mins. 50/100 = no timer.
  const hasTimer = tests.length === 20

  // Update getFLabel to match F1, F2... logic looks good, but let's ensure styling matches
  // Image 2 shows: Grey bold box left, White text box right.

  // Image 4 Design Implementation
  // - Background: Light Blue #E9F6FF (global)
  // - Nav: Number row top.
  // - Layout: Image Left, Answers Right.
  // - Answer Style: White bg, Green/Blue border, Radio circle icon left.
  // - Button: Blue "Keyingisi" centered.

  return (
    <main className="min-h-screen bg-[#E9F6FF] font-sans">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {/* Logo placeholder if needed, or just Back */}
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Orqaga
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {hasTimer && (
            <div className="font-mono font-bold text-xl text-blue-600 bg-blue-50 px-3 py-1 rounded border border-blue-100">
              <Timer durationSeconds={1500} onTimeUp={handleFinish} />
            </div>
          )}
          <Button onClick={handleFinish} className="bg-[#1976D2] hover:bg-[#1565C0] text-white font-medium px-6">
            Testni yakunlash
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Navigation Strip */}
        <div className="bg-white p-2 rounded-lg shadow-sm mb-6 overflow-x-auto border border-gray-200">
          <div className="flex gap-1 min-w-max">
            {tests.map((_, idx) => {
              const isActive = currentIndex === idx
              const isAns = answeredQuestions[idx]
              const correct = selectedAnswers[idx] === tests[idx].correct_answer

              // Style based on Image 4 navigation (Blue active, White default)
              let bg = "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              if (isActive) bg = "bg-[#1976D2] text-white border-[#1976D2]"
              else if (isAns) bg = correct ? "bg-green-600 text-white border-green-600" : "bg-red-600 text-white border-red-600"

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[500px] flex flex-col items-center">

          <h2 className="text-xl md:text-2xl font-semibold text-center text-gray-800 mb-8 max-w-4xl">
            {displayQuestion}
          </h2>

          <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">
            {/* Left: Image */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-md aspect-[4/3] bg-gray-50 rounded-lg border border-gray-200 overflow-hidden cursor-zoom-in"
                onClick={() => currentTest.image_url && setModalImage(currentTest.image_url)}
              >
                {currentTest.image_url ? (
                  <Image src={currentTest.image_url} alt="Question" fill className="object-contain" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <BookOpen className="w-12 h-12 opacity-20" />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Answers */}
            <div className="w-full lg:w-1/2 flex flex-col gap-3">
              {displayAnswers.map((answer, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentTest.correct_answer
                const showFeedback = isAnswered

                // Styles for Image 4 matching
                // Base: Light Green/Blue border + Green Text? Or just simple?
                // User's image has Green borders for unselected items. 
                // Let's stick to standard behavior first but clean up.
                // Active/Selected: dark blue border?

                let containerClass = "border border-gray-300 bg-white hover:bg-gray-50"
                let circleClass = "border-2 border-gray-300 text-transparent"

                if (isSelected) {
                  containerClass = "border-2 border-[#1976D2] bg-blue-50"
                  circleClass = "border-[#1976D2] bg-[#1976D2] text-white"
                }

                if (showFeedback) {
                  if (isSelected) {
                    if (isCorrect) {
                      containerClass = "border-2 border-green-500 bg-green-50"
                      circleClass = "border-green-500 bg-green-500 text-white"
                    } else {
                      containerClass = "border-2 border-red-500 bg-red-50"
                      circleClass = "border-red-500 bg-red-500 text-white"
                    }
                  } else if (isCorrect) {
                    containerClass = "border-2 border-green-500 bg-green-50"
                    circleClass = "border-green-500 text-green-500 bg-green-500" // Filled green for correct indication
                  }
                }

                return (
                  <div
                    key={index}
                    onClick={() => !isAnswered && handleAnswerSelect(index)}
                    className={`
                              flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all min-h-[50px]
                              ${containerClass}
                           `}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${circleClass}`}>
                      {/* Inner dot or check icon can go here */}
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </div>
                    <span className="text-lg text-gray-800 font-medium leading-snug">{answer}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Next Button */}
          <div className="mt-10 mb-4">
            <Button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              disabled={currentIndex === tests.length - 1}
              className="bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold text-lg px-12 py-6 rounded-lg shadow-md"
            >
              Keyingisi
            </Button>
          </div>

        </div>
      </div>

      {modalImage && (
        <ImageModal isOpen={!!modalImage} onClose={() => setModalImage(null)} imageUrl={modalImage} />
      )}
    </main>
  )
}
