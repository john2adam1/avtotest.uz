"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Clock, CheckCircle2, XCircle, Volume2 } from "lucide-react"
import Image from "next/image"

interface Test {
  id: string
  category_id: string
  image_url: string
  audio_url: string | null
  question: string
  answers: string[]
  correct_answer: number
  time_limit: number
}

interface TestInterfaceProps {
  categoryTitle: string
  tests: Test[]
  userId: string
}

export function TestInterface({ categoryTitle, tests, userId }: TestInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})

  // Helper to fix PostImage viewer links to direct links
  const getFixedImageUrl = (url: string) => {
    if (!url) return url
    if (url.includes("postimg.cc") && !url.includes("i.postimg.cc")) {
      return url.replace("postimg.cc/", "i.postimg.cc/") + "/image.png"
    }
    return url
  }

  const [timeLeft, setTimeLeft] = useState(tests[0]?.time_limit || 300)
  const [isFinished, setIsFinished] = useState(false)
  const [results, setResults] = useState<{ correct: number; wrong: number; score: number } | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (isFinished) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isFinished])

  const handleFinish = async () => {
    setIsFinished(true)

    let correct = 0
    let wrong = 0

    tests.forEach((test, index) => {
      const selectedAnswer = selectedAnswers[index]
      if (selectedAnswer !== undefined) {
        if (selectedAnswer === test.correct_answer) {
          correct++
        } else {
          wrong++
        }
      } else {
        wrong++
      }
    })

    const score = Math.round((correct / tests.length) * 100)
    setResults({ correct, wrong, score })

    // Save results to database
    await supabase.from("test_results").insert({
      user_id: userId,
      test_id: tests[0].id,
      score,
      total_questions: tests.length,
      correct_answers: correct,
      wrong_answers: wrong,
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, "0")}`
  }

  if (isFinished && results) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Test yakunlandi!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{results.score}%</div>
              <div className="text-muted-foreground">Final ball</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4 text-center">
                <div className="text-2xl font-bold">{tests.length}</div>
                <div className="text-sm text-muted-foreground">Jami savollar</div>
              </div>
              <div className="rounded-lg border bg-success/10 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-success">
                  <CheckCircle2 className="h-6 w-6" />
                  {results.correct}
                </div>
                <div className="text-sm text-muted-foreground">To'g'ri javoblar</div>
              </div>
              <div className="rounded-lg border bg-destructive/10 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-destructive">
                  <XCircle className="h-6 w-6" />
                  {results.wrong}
                </div>
                <div className="text-sm text-muted-foreground">Noto'g'ri javoblar</div>
              </div>
            </div>

            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Dashboardga qaytish
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const currentTest = tests[currentIndex]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{categoryTitle}</h1>
            <p className="text-muted-foreground">
              Savol {currentIndex + 1} of {tests.length}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={getFixedImageUrl(currentTest.image_url || "/placeholder.svg")}
                alt="Question image"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            {currentTest.audio_url && (
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Audio savol</p>
                    <audio controls className="w-full" src={currentTest.audio_url}>
                      Sizning brauzeringiz audio elementini qo'llab-quvvatlamaydi.
                    </audio>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">{currentTest.question}</h2>
              <RadioGroup
                key={currentIndex}
                value={selectedAnswers[currentIndex]?.toString()}
                onValueChange={(value) =>
                  setSelectedAnswers({ ...selectedAnswers, [currentIndex]: Number.parseInt(value) })
                }
              >
                {currentTest.answers.map((answer, index) => (
                  <div key={index} className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
                    <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                    <Label htmlFor={`answer-${index}`} className="flex-1 cursor-pointer">
                      {answer}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-2">
              {currentIndex > 0 && (
                <Button variant="outline" onClick={() => setCurrentIndex(currentIndex - 1)} className="flex-1">
                  Oldingi
                </Button>
              )}
              {currentIndex < tests.length - 1 ? (
                <Button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="flex-1"
                  disabled={selectedAnswers[currentIndex] === undefined}
                >
                  Keyingi
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="flex-1"
                  disabled={selectedAnswers[currentIndex] === undefined}
                >
                  Testni yakunlash
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
