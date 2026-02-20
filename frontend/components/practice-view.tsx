"use client"

import { useState, useMemo } from "react"
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  RotateCcw,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { QuizQuestion, Topic } from "@/lib/course-data"

interface PracticeViewProps {
  questions: QuizQuestion[]
  topics: Topic[]
}

export function PracticeView({ questions, topics }: PracticeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResult, setShowResult] = useState(false)
  const [finished, setFinished] = useState(false)

  const question = questions[currentIndex]
  const progressPercent = ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100

  const handleSelect = (optIdx: number) => {
    if (showResult) return
    setAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }))
  }

  const handleCheck = () => {
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setShowResult(false)
    } else {
      setFinished(true)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setAnswers({})
    setShowResult(false)
    setFinished(false)
  }

  const score = useMemo(() => {
    let correct = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) correct++
    })
    return correct
  }, [answers, questions])

  const topicPerformance = useMemo(() => {
    const perf: Record<string, { correct: number; total: number; name: string }> = {}
    questions.forEach((q, idx) => {
      const topic = topics.find((t) => t.id === q.topicId)
      if (!perf[q.topicId]) {
        perf[q.topicId] = { correct: 0, total: 0, name: topic?.name || "Unknown" }
      }
      perf[q.topicId].total++
      if (answers[idx] === q.correctIndex) {
        perf[q.topicId].correct++
      }
    })
    return Object.values(perf)
  }, [answers, questions, topics])

  if (finished) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 max-w-2xl mx-auto">
          <div className="rounded-xl border bg-card p-6 shadow-sm text-center mb-6">
            <div className="mb-4">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-card-foreground mb-1">
                Practice Complete
              </h2>
              <p className="text-sm text-muted-foreground">
                You scored {score} out of {questions.length}
              </p>
            </div>
            <div className="mb-4">
              <Progress
                value={(score / questions.length) * 100}
                className="h-3 mx-auto max-w-xs"
              />
              <p className="mt-2 text-2xl font-bold text-primary">
                {Math.round((score / questions.length) * 100)}%
              </p>
            </div>
          </div>

          {/* Topic Breakdown */}
          <div className="rounded-xl border bg-card p-5 shadow-sm mb-6">
            <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Performance by Topic
            </h3>
            <div className="flex flex-col gap-3">
              {topicPerformance.map((tp, idx) => {
                const percent =
                  tp.total > 0 ? Math.round((tp.correct / tp.total) * 100) : 0
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-card-foreground">{tp.name}</span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {tp.correct}/{tp.total}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          percent >= 70
                            ? "bg-emerald-500"
                            : percent >= 40
                              ? "bg-amber-400"
                              : "bg-red-400"
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Button onClick={handleRestart} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            Retry Practice
          </Button>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-card-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <Badge
              className={cn(
                "text-xs",
                question.difficulty === "easy" && "bg-emerald-100 text-emerald-700 border-emerald-200",
                question.difficulty === "medium" && "bg-amber-100 text-amber-700 border-amber-200",
                question.difficulty === "hard" && "bg-red-100 text-red-700 border-red-200"
              )}
              variant="outline"
            >
              <Zap className="h-3 w-3 mr-1" />
              {question.difficulty}
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question */}
        <div className="rounded-xl border bg-card p-6 shadow-sm mb-6">
          <p className="text-base font-medium text-card-foreground mb-5">
            {question.question}
          </p>
          <div className="flex flex-col gap-2.5">
            {question.options.map((opt, optIdx) => {
              const isSelected = answers[currentIndex] === optIdx
              const isCorrect = optIdx === question.correctIndex

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelect(optIdx)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-sm text-left transition-all",
                    !showResult && isSelected
                      ? "border-primary bg-primary/10 text-primary font-medium shadow-sm"
                      : !showResult
                        ? "border-border text-card-foreground hover:border-primary/40 hover:bg-primary/5"
                        : showResult && isCorrect
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-medium"
                          : showResult && isSelected && !isCorrect
                            ? "border-red-300 bg-red-50 text-red-700"
                            : "border-border text-muted-foreground"
                  )}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {showResult && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div className="mt-4 rounded-lg bg-secondary/80 p-3.5">
              <p className="text-sm text-card-foreground">
                <span className="font-semibold">Explanation: </span>
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!showResult ? (
            <Button
              onClick={handleCheck}
              disabled={answers[currentIndex] === undefined}
              className="flex-1"
            >
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1 gap-2">
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                "See Results"
              )}
            </Button>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
