"use client"

import {
  BookOpen,
  Dumbbell,
  RotateCcw,
  ArrowRight,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { LearnView } from "@/components/learn-view"
import { PracticeView } from "@/components/practice-view"
import { ReviseView } from "@/components/revise-view"
import type { Unit, Topic, QuizQuestion } from "@/lib/course-data"

type StudyMode = "learn" | "practice" | "revise"

interface StudyWorkspaceProps {
  unit: Unit
  courseName: string
  selectedTopic: Topic | null
  studyMode: StudyMode
  onStudyModeChange: (mode: StudyMode) => void
  quizQuestions: QuizQuestion[]
  onSelectTopic: (topicId: string) => void
}

export function StudyWorkspace({
  unit,
  courseName,
  selectedTopic,
  studyMode,
  onStudyModeChange,
  quizQuestions,
  onSelectTopic,
}: StudyWorkspaceProps) {
  const weakTopics = unit.topics.filter((t) => t.status === "needs-practice")
  const suggestedTopic = weakTopics[0]

  const handleNextTopic = () => {
    if (!selectedTopic) return
    const currentIdx = unit.topics.findIndex((t) => t.id === selectedTopic.id)
    if (currentIdx < unit.topics.length - 1) {
      onSelectTopic(unit.topics[currentIdx + 1].id)
    }
  }

  const hasNextTopic =
    selectedTopic !== null &&
    unit.topics.findIndex((t) => t.id === selectedTopic.id) <
      unit.topics.length - 1

  const modes: { key: StudyMode; label: string; icon: React.ReactNode }[] = [
    { key: "learn", label: "Learn", icon: <BookOpen className="h-4 w-4" /> },
    {
      key: "practice",
      label: "Practice",
      icon: <Dumbbell className="h-4 w-4" />,
    },
    {
      key: "revise",
      label: "Revise",
      icon: <RotateCcw className="h-4 w-4" />,
    },
  ]

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header Area */}
      <div className="border-b bg-card px-6 py-4">
        {/* Course + Unit Info */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-card-foreground">
              {courseName}
            </h1>
            <p className="text-sm text-muted-foreground">{unit.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Progress</span>
              <p className="text-sm font-bold text-primary">{unit.progress}%</p>
            </div>
            <div className="h-8 w-8">
              <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-secondary"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="3"
                  strokeDasharray={`${unit.progress} ${100 - unit.progress}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Suggested Action */}
        {suggestedTopic && (
          <button
            onClick={() => {
              onSelectTopic(suggestedTopic.id)
              onStudyModeChange("revise")
            }}
            className="flex w-full items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mb-3 text-left transition-colors hover:bg-amber-100"
          >
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-xs text-amber-700 flex-1">
              <span className="font-semibold">Suggested:</span> Revise{" "}
              {suggestedTopic.name} - Weak Area
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-amber-500" />
          </button>
        )}

        {/* Mode Toggles */}
        <div className="flex gap-1.5 rounded-xl bg-secondary p-1">
          {modes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => onStudyModeChange(mode.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                studyMode === mode.key
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-card-foreground"
              )}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {studyMode === "learn" && selectedTopic && (
          <LearnView
            topic={selectedTopic}
            onNextTopic={handleNextTopic}
            hasNextTopic={hasNextTopic}
          />
        )}
        {studyMode === "learn" && !selectedTopic && (
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a topic from the sidebar to start learning
              </p>
            </div>
          </div>
        )}
        {studyMode === "practice" && (
          <PracticeView questions={quizQuestions} topics={unit.topics} />
        )}
        {studyMode === "revise" && <ReviseView topics={unit.topics} />}
      </div>
    </div>
  )
}
