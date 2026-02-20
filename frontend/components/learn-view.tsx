"use client"

import { useState } from "react"
import {
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Topic } from "@/lib/course-data"

interface LearnViewProps {
  topic: Topic
  onNextTopic: () => void
  hasNextTopic: boolean
}

interface MiniQuizQuestion {
  question: string
  options: string[]
  correctIndex: number
}

const miniQuizzes: Record<string, MiniQuizQuestion[]> = {
  t1: [
    {
      question: "What data structure does the OS use to manage each process?",
      options: ["Stack Frame", "Process Control Block (PCB)", "Hash Table", "Linked List"],
      correctIndex: 1,
    },
    {
      question: "Which is NOT a valid process state?",
      options: ["Ready", "Executing", "Waiting", "New"],
      correctIndex: 1,
    },
  ],
  t2: [
    {
      question: "Which scheduling algorithm can cause the convoy effect?",
      options: ["SJF", "Round Robin", "FCFS", "Priority"],
      correctIndex: 2,
    },
    {
      question: "What technique solves starvation in priority scheduling?",
      options: ["Preemption", "Aging", "Batching", "Polling"],
      correctIndex: 1,
    },
  ],
  t3: [
    {
      question: "What do threads within the same process NOT share?",
      options: ["Code section", "Data section", "Stack", "OS resources"],
      correctIndex: 2,
    },
    {
      question: "Which threading model maps many user threads to many kernel threads?",
      options: ["One-to-One", "Many-to-One", "Many-to-Many", "One-to-Many"],
      correctIndex: 2,
    },
  ],
}

export function LearnView({ topic, onNextTopic, hasNextTopic }: LearnViewProps) {
  const questions = miniQuizzes[topic.id] || [
    {
      question: `What is the primary concept behind ${topic.name}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
    },
    {
      question: `Which scenario best demonstrates ${topic.name}?`,
      options: ["Scenario 1", "Scenario 2", "Scenario 3", "Scenario 4"],
      correctIndex: 0,
    },
  ]

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const handleReset = () => {
    setSelectedAnswers({})
    setSubmitted(false)
  }

  const allAnswered = Object.keys(selectedAnswers).length === questions.length

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-3xl mx-auto">
        {/* Topic Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-card-foreground mb-2 text-balance">
            {topic.name}
          </h2>
          <Badge
            className={cn(
              "text-xs",
              topic.status === "strong" && "bg-emerald-100 text-emerald-700 border-emerald-200",
              topic.status === "moderate" && "bg-amber-100 text-amber-700 border-amber-200",
              topic.status === "needs-practice" && "bg-red-100 text-red-700 border-red-200"
            )}
            variant="outline"
          >
            {topic.status === "strong"
              ? "Strong"
              : topic.status === "moderate"
                ? "Moderate"
                : "Needs Practice"}
          </Badge>
        </div>

        {/* Explanation */}
        <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Explanation
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {topic.description}
          </p>
        </div>

        {/* Diagram placeholder */}
        <div className="mb-6 rounded-xl border border-dashed bg-secondary/50 p-8 flex flex-col items-center justify-center gap-2">
          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
          <span className="text-xs text-muted-foreground">
            Diagram: {topic.name} visualization
          </span>
        </div>

        {/* Key Takeaways */}
        <div className="mb-6 rounded-xl border bg-primary/5 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Key Takeaways
          </h3>
          <ul className="flex flex-col gap-2">
            {topic.keyTakeaways.map((takeaway, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm text-card-foreground"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mini Quiz */}
        <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">
            Quick Check
          </h3>
          <div className="flex flex-col gap-5">
            {questions.map((q, qIdx) => (
              <div key={qIdx}>
                <p className="text-sm font-medium text-card-foreground mb-2.5">
                  {qIdx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[qIdx] === optIdx
                    const isCorrect = optIdx === q.correctIndex
                    const showResult = submitted

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(qIdx, optIdx)}
                        className={cn(
                          "text-left rounded-lg border px-3.5 py-2.5 text-sm transition-all",
                          !showResult && isSelected
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : !showResult
                              ? "border-border text-card-foreground hover:border-primary/40 hover:bg-primary/5"
                              : showResult && isCorrect
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-medium"
                                : showResult && isSelected && !isCorrect
                                  ? "border-red-300 bg-red-50 text-red-700"
                                  : "border-border text-muted-foreground"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {showResult && isCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          {opt}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            {!submitted ? (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!allAnswered}
              >
                Check Answers
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handleReset}>
                Try Again
              </Button>
            )}
          </div>
        </div>

        {/* Next Topic */}
        {hasNextTopic && (
          <Button onClick={onNextTopic} className="w-full gap-2">
            Next Recommended Topic
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </ScrollArea>
  )
}
