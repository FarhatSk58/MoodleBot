"use client"

import { useState } from "react"
import { UnitsNavigator } from "@/components/units-navigator"
import { StudyWorkspace } from "@/components/study-workspace"
import { AiAssistant } from "@/components/ai-assistant"
import { courseData, quizQuestions } from "@/lib/course-data"
import { ArrowLeft, Menu, MessageCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

type StudyMode = "learn" | "practice" | "revise"

interface DashboardProps {
  onBack?: () => void
}

export function Dashboard({ onBack }: DashboardProps) {
  const [selectedUnitId, setSelectedUnitId] = useState(courseData.units[0].id)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    courseData.units[0].topics[0]?.id || null
  )
  const [studyMode, setStudyMode] = useState<StudyMode>("learn")
  const [showLeftPanel, setShowLeftPanel] = useState(false)
  const [showRightPanel, setShowRightPanel] = useState(false)

  const selectedUnit = courseData.units.find((u) => u.id === selectedUnitId)!
  const selectedTopic =
    selectedTopicId
      ? selectedUnit.topics.find((t) => t.id === selectedTopicId) || null
      : null

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId)
    const unit = courseData.units.find((u) => u.id === unitId)
    if (unit && unit.topics.length > 0) {
      setSelectedTopicId(unit.topics[0].id)
    } else {
      setSelectedTopicId(null)
    }
  }

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId)
    setShowLeftPanel(false)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile nav */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b bg-card px-4 py-2.5 lg:hidden">
        <div className="flex items-center gap-1">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Back to courses"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => {
              setShowLeftPanel(!showLeftPanel)
              setShowRightPanel(false)
            }}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
            aria-label="Toggle navigation"
          >
            {showLeftPanel ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <span className="text-sm font-semibold text-card-foreground">
          StudyAI
        </span>
        <button
          onClick={() => {
            setShowRightPanel(!showRightPanel)
            setShowLeftPanel(false)
          }}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
          aria-label="Toggle AI assistant"
        >
          {showRightPanel ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </button>
      </div>

      {/* Left Panel - Navigator */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r transition-transform duration-200 lg:static lg:translate-x-0",
          showLeftPanel ? "translate-x-0" : "-translate-x-full",
          "top-11 lg:top-0"
        )}
      >
        <UnitsNavigator
          course={courseData}
          selectedUnitId={selectedUnitId}
          selectedTopicId={selectedTopicId}
          onSelectUnit={handleSelectUnit}
          onSelectTopic={handleSelectTopic}
          onBack={onBack}
        />
      </aside>

      {/* Backdrop for mobile panels */}
      {(showLeftPanel || showRightPanel) && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
          onClick={() => {
            setShowLeftPanel(false)
            setShowRightPanel(false)
          }}
        />
      )}

      {/* Center Panel - Workspace */}
      <main className="flex-1 overflow-hidden pt-11 lg:pt-0">
        <StudyWorkspace
          unit={selectedUnit}
          courseName={courseData.name}
          selectedTopic={selectedTopic}
          studyMode={studyMode}
          onStudyModeChange={setStudyMode}
          quizQuestions={quizQuestions}
          onSelectTopic={handleSelectTopic}
        />
      </main>

      {/* Right Panel - AI Assistant */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-80 border-l transition-transform duration-200 lg:static lg:translate-x-0",
          showRightPanel ? "translate-x-0" : "translate-x-full",
          "top-11 lg:top-0"
        )}
      >
        <AiAssistant
          selectedTopic={selectedTopic}
          unitName={selectedUnit.name}
        />
      </aside>
    </div>
  )
}
