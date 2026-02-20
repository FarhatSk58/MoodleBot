"use client"

import { useState } from "react"
import {
  ListChecks,
  FlaskConical,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Topic } from "@/lib/course-data"

interface ReviseViewProps {
  topics: Topic[]
}

export function ReviseView({ topics }: ReviseViewProps) {
  const [flashcardIndex, setFlashcardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const flashcards = topics.flatMap((t) =>
    t.keyTakeaways.map((takeaway, idx) => ({
      id: `${t.id}-${idx}`,
      front: `${t.name}`,
      back: takeaway,
      topicName: t.name,
    }))
  )

  const allFormulas = topics.flatMap((t) =>
    (t.formulas || []).map((f) => ({ formula: f, topic: t.name }))
  )

  const allExamQuestions = topics.flatMap((t) =>
    (t.examQuestions || []).map((q) => ({ question: q, topic: t.name }))
  )

  const bulletSummary = topics.map((t) => ({
    name: t.name,
    status: t.status,
    points: t.keyTakeaways,
  }))

  const nextCard = () => {
    setFlashcardIndex((prev) => Math.min(prev + 1, flashcards.length - 1))
    setIsFlipped(false)
  }

  const prevCard = () => {
    setFlashcardIndex((prev) => Math.max(prev - 1, 0))
    setIsFlipped(false)
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-3xl mx-auto">
        {/* Bullet-point Summary */}
        <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            Unit Summary
          </h3>
          <div className="flex flex-col gap-4">
            {bulletSummary.map((section, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2 mb-1.5">
                  <h4 className="text-sm font-medium text-card-foreground">
                    {section.name}
                  </h4>
                  <Badge
                    className={cn(
                      "text-[10px] h-4 px-1.5",
                      section.status === "strong" && "bg-emerald-100 text-emerald-700 border-emerald-200",
                      section.status === "moderate" && "bg-amber-100 text-amber-700 border-amber-200",
                      section.status === "needs-practice" && "bg-red-100 text-red-700 border-red-200"
                    )}
                    variant="outline"
                  >
                    {section.status === "strong"
                      ? "Strong"
                      : section.status === "moderate"
                        ? "Moderate"
                        : "Weak"}
                  </Badge>
                </div>
                <ul className="flex flex-col gap-1 ml-4">
                  {section.points.map((point, pIdx) => (
                    <li
                      key={pIdx}
                      className="text-sm text-muted-foreground list-disc"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Important Formulas */}
        {allFormulas.length > 0 && (
          <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              Important Formulas
            </h3>
            <div className="flex flex-col gap-2">
              {allFormulas.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg bg-secondary/60 px-3.5 py-2.5"
                >
                  <code className="text-sm font-mono text-card-foreground flex-1">
                    {f.formula}
                  </code>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {f.topic}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Likely Exam Questions */}
        {allExamQuestions.length > 0 && (
          <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Likely Exam Questions
            </h3>
            <div className="flex flex-col gap-2.5">
              {allExamQuestions.map((eq, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border px-3.5 py-3"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-card-foreground">{eq.question}</p>
                    <span className="text-[11px] text-muted-foreground">
                      {eq.topic}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flashcards */}
        {flashcards.length > 0 && (
          <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Flashcards
              <span className="text-xs text-muted-foreground font-normal ml-auto">
                {flashcardIndex + 1} / {flashcards.length}
              </span>
            </h3>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full"
            >
              <div
                className={cn(
                  "relative mx-auto flex min-h-[180px] items-center justify-center rounded-xl border-2 px-6 py-8 text-center transition-all duration-300 cursor-pointer",
                  isFlipped
                    ? "border-primary bg-primary/5"
                    : "border-border bg-secondary/50 hover:border-primary/30"
                )}
              >
                {!isFlipped ? (
                  <div>
                    <Badge
                      variant="secondary"
                      className="mb-3 text-[10px]"
                    >
                      {flashcards[flashcardIndex].topicName}
                    </Badge>
                    <p className="text-base font-medium text-card-foreground">
                      {flashcards[flashcardIndex].front}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Tap to reveal
                    </p>
                  </div>
                ) : (
                  <div>
                    <Badge className="mb-3 text-[10px] bg-primary/10 text-primary border-primary/20" variant="outline">
                      Answer
                    </Badge>
                    <p className="text-sm text-card-foreground leading-relaxed">
                      {flashcards[flashcardIndex].back}
                    </p>
                  </div>
                )}
              </div>
            </button>

            <div className="flex items-center justify-center gap-3 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={prevCard}
                disabled={flashcardIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFlashcardIndex(0)
                  setIsFlipped(false)
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={nextCard}
                disabled={flashcardIndex === flashcards.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
