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
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, boolean>>({})
  const [isFinished, setIsFinished] = useState(false)
  const [results, setResults] = useState<{ correct: number; wrong: number; unanswered: number; score: number } | null>(null)
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({})
  const [playingAudio, setPlayingAudio] = useState<Record<number, boolean>>({})
  const audioRefs = useRef<Record<number, HTMLAudioElement>>({})
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  // We rely on i18next for language, but we can verify consistency if needed.
  // The userSettings language should ideally ideally match i18n.language, but i18next is the source of truth for UI.
  const questionFontSize = userSettings?.question_font_size || 16
  const answerFontSize = userSettings?.answer_font_size || 14

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
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentIndex, tests.length, isFinished])

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: answerIndex })
    setAnsweredQuestions({ ...answeredQuestions, [currentIndex]: true })
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

  const currentTest = tests[currentIndex]
  const selectedAnswer = selectedAnswers[currentIndex]
  const isAnswered = answeredQuestions[currentIndex]

  return (
    <main className="container mx-auto px-4 py-6 md:py-10">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Orqaga
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">
              {title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {currentIndex + 1} / {tests.length}
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleFinish} className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
            {t("test.finish")}
          </Button>
        </div>

        <Card className="bg-background/60 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden rounded-3xl">
          <QuizProtection>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left side: Question Image & Text */}
                <div className="p-6 md:p-8 bg-muted/20 border-b lg:border-b-0 lg:border-r border-white/5 space-y-6">
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black/5 shadow-inner flex items-center justify-center group">
                    {currentTest.image_url ? (
                      <Image
                        src={currentTest.image_url}
                        alt="Question image"
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-muted-foreground/50">
                        <BookOpen className="h-24 w-24" />
                        <span className="text-sm">Rasm yo'q</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold leading-relaxed text-foreground" style={{ fontSize: `${questionFontSize}px` }}>
                      {currentTest.question}
                    </h2>
                  </div>
                </div>

                {/* Right side: Answers & Controls */}
                <div className="p-6 md:p-8 flex flex-col h-full justify-between gap-6 bg-background/40">

                  {/* Navigation Bar (Number Strip) - Hidden for random tests */}
                  {testType !== "random" && (
                    <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                      <div className="flex gap-2 min-w-max">
                        {tests.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`
                                          h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all
                                          ${currentIndex === idx
                                ? "bg-primary text-primary-foreground shadow-lg scale-110"
                                : answeredQuestions[idx]
                                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }
                                      `}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <RadioGroup
                    key={currentIndex}
                    value={selectedAnswer?.toString()}
                    onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
                    className="space-y-4"
                  >
                    {currentTest.answers.map((answer, index) => {
                      const isSelected = selectedAnswer === index
                      const isCorrect = index === currentTest.correct_answer
                      const showFeedback = isAnswered

                      let containerClass = "border-transparent bg-secondary/30 hover:bg-secondary/50"
                      let labelClass = "text-foreground"
                      let circleClass = "border-muted-foreground/30 bg-transparent"
                      let circleInner = null

                      if (isSelected) {
                        containerClass = "border-primary bg-primary/10 shadow-md ring-1 ring-primary transition-all scale-[1.01]"
                        circleClass = "border-primary bg-primary"
                        circleInner = <div className="h-2.5 w-2.5 rounded-full bg-background" />
                      }

                      if (showFeedback) {
                        if (isSelected) {
                          if (!isCorrect) {
                            containerClass = "border-red-500 bg-red-500/10 shadow-md ring-1 ring-red-500"
                            circleClass = "border-red-500 bg-red-500"
                            circleInner = <XCircle className="h-4 w-4 text-white" />
                          } else {
                            containerClass = "border-green-500 bg-green-500/10 shadow-md ring-1 ring-green-500"
                            circleClass = "border-green-500 bg-green-500"
                            circleInner = <CheckCircle2 className="h-4 w-4 text-white" />
                          }
                        } else if (isCorrect) {
                          containerClass = "border-green-500/50 bg-green-500/5 shadow-sm ring-1 ring-green-500/50"
                          circleClass = "border-green-500 bg-green-500"
                          circleInner = <CheckCircle2 className="h-4 w-4 text-white" />
                        } else {
                          containerClass = "opacity-50 grayscale"
                        }
                      }

                      return (
                        <div
                          key={index}
                          onClick={() => !isAnswered && handleAnswerSelect(index)}
                          className={`
                             group relative flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 cursor-pointer
                             ${containerClass}
                          `}
                        >
                          <RadioGroupItem
                            value={index.toString()}
                            id={`answer-${index}`}
                            disabled={isAnswered}
                            className="absolute opacity-0 w-0 h-0 overflow-hidden"
                          />

                          {/* Visual Radio Circle */}
                          <div className={`
                             flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all
                             ${circleClass}
                             group-hover:border-primary
                          `}>
                            {circleInner}
                          </div>

                          <Label
                            htmlFor={`answer-${index}`}
                            className={`flex-1 cursor-pointer font-medium leading-normal ${labelClass}`}
                            style={{ fontSize: `${answerFontSize}px` }}
                          >
                            {answer}
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                  <div className="space-y-4">
                    {/* Audio and Explanation Tools */}
                    <div className="flex gap-3 justify-end pt-2">
                      {currentTest.audio_url && (
                        <Button
                          variant={playingAudio[currentIndex] ? "default" : "secondary"}
                          size="icon"
                          className="rounded-full h-10 w-10 shadow-sm"
                          onClick={() => toggleAudio(currentIndex)}
                        >
                          <Volume2 className="h-5 w-5" />
                        </Button>
                      )}
                      {currentTest.explanation_text && (
                        <Button
                          variant={showExplanation[currentIndex] ? "default" : "secondary"}
                          size="icon"
                          className="rounded-full h-10 w-10 shadow-sm"
                          onClick={() => toggleExplanation(currentIndex)}
                        >
                          <Lightbulb className="h-5 w-5" />
                        </Button>
                      )}
                    </div>

                    {/* Explanation display */}
                    {showExplanation[currentIndex] && currentTest.explanation_text && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 p-5 space-y-2 animate-in fade-in slide-in-from-top-2">
                        {currentTest.explanation_title && (
                          <h3 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            {currentTest.explanation_title}
                          </h3>
                        )}
                        <p className="text-sm text-foreground/80 leading-relaxed">{currentTest.explanation_text}</p>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={() => setCurrentIndex(currentIndex - 1)} disabled={currentIndex === 0} className="flex-1 h-12 text-base rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/50">
                        Avvalgi
                      </Button>
                      {currentIndex < tests.length - 1 ? (
                        <Button
                          onClick={() => setCurrentIndex(currentIndex + 1)}
                          className="flex-1 h-12 text-base rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        >
                          Keyingi
                        </Button>

                      ) : (
                        <Button onClick={handleFinish} disabled={selectedAnswer === undefined} className="flex-1 h-12 text-base rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 text-white">
                          {t("test.finish")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </QuizProtection>
        </Card>
      </div >
    </main >
  )
}
