"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  BookOpen,
  CircleDot,
  Lock,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Course, Unit, Topic, TopicStatus } from "@/lib/course-data"

function StatusDot({ status }: { status: TopicStatus }) {
  const colors: Record<TopicStatus, string> = {
    strong: "bg-emerald-500",
    moderate: "bg-amber-400",
    "needs-practice": "bg-red-400",
  }
  return (
    <span
      className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", colors[status])}
      aria-label={status}
    />
  )
}

function statusLabel(status: TopicStatus) {
  switch (status) {
    case "strong":
      return "Strong"
    case "moderate":
      return "Moderate"
    case "needs-practice":
      return "Needs Practice"
  }
}

interface UnitsNavigatorProps {
  course: Course
  selectedUnitId: string
  selectedTopicId: string | null
  onSelectUnit: (unitId: string) => void
  onSelectTopic: (topicId: string) => void
  onBack?: () => void
}

export function UnitsNavigator({
  course,
  selectedUnitId,
  selectedTopicId,
  onSelectUnit,
  onSelectTopic,
  onBack,
}: UnitsNavigatorProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(
    new Set([selectedUnitId])
  )

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev)
      if (next.has(unitId)) {
        next.delete(unitId)
      } else {
        next.add(unitId)
      }
      return next
    })
  }

  const selectedUnit = course.units.find((u) => u.id === selectedUnitId)

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="border-b p-4">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-2 hidden items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground lg:flex"
            aria-label="Back to courses"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Courses
          </button>
        )}
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {course.code}
          </span>
        </div>
        <h2 className="text-sm font-semibold text-card-foreground truncate">
          {course.name}
        </h2>
      </div>

      {/* Unit Progress */}
      {selectedUnit && (
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Unit Progress
            </span>
            <span className="text-xs font-semibold text-primary">
              {selectedUnit.progress}%
            </span>
          </div>
          <Progress value={selectedUnit.progress} className="h-2" />
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b">
        <div className="flex items-center gap-1.5">
          <StatusDot status="strong" />
          <span className="text-[10px] text-muted-foreground">Strong</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusDot status="moderate" />
          <span className="text-[10px] text-muted-foreground">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusDot status="needs-practice" />
          <span className="text-[10px] text-muted-foreground">Weak</span>
        </div>
      </div>

      {/* Units List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {course.units.map((unit, idx) => {
            const isExpanded = expandedUnits.has(unit.id)
            const isSelected = unit.id === selectedUnitId
            const hasTopics = unit.topics.length > 0

            return (
              <div key={unit.id} className="mb-1">
                <button
                  onClick={() => {
                    if (hasTopics) {
                      onSelectUnit(unit.id)
                      toggleUnit(unit.id)
                    }
                  }}
                  disabled={!hasTopics}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary font-medium"
                      : hasTopics
                        ? "text-card-foreground hover:bg-secondary"
                        : "text-muted-foreground cursor-not-allowed opacity-60"
                  )}
                >
                  {hasTopics ? (
                    isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    )
                  ) : (
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="truncate flex-1">
                    Unit {idx + 1}: {unit.name}
                  </span>
                  {hasTopics && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 font-medium"
                    >
                      {unit.topics.length}
                    </Badge>
                  )}
                </button>

                {/* Topics */}
                {isExpanded && hasTopics && (
                  <div className="ml-3 mt-0.5 border-l-2 border-border pl-2">
                    {unit.topics.map((topic, tIdx) => (
                      <button
                        key={topic.id}
                        onClick={() => onSelectTopic(topic.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors",
                          topic.id === selectedTopicId
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-card-foreground hover:bg-secondary"
                        )}
                      >
                        <StatusDot status={topic.status} />
                        <span className="truncate flex-1">
                          {tIdx + 1}. {topic.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
