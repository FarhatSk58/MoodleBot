"use client"

import {
  BookOpen,
  FileQuestion,
  BarChart3,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface TeacherHomeProps {
  onAddCourse: () => void
  onNavigate: (view: string) => void
}

const existingCourses = [
  {
    id: "cs301",
    code: "CS 301",
    name: "Operating Systems",
    semester: "Fall 2025",
    units: 5,
    topics: 42,
    questionsGenerated: 128,
    completion: 85,
    status: "published" as const,
  },
  {
    id: "cs201",
    code: "CS 201",
    name: "Data Structures",
    semester: "Fall 2025",
    units: 5,
    topics: 38,
    questionsGenerated: 96,
    completion: 72,
    status: "published" as const,
  },
  {
    id: "cs302",
    code: "CS 302",
    name: "Computer Networks",
    semester: "Fall 2025",
    units: 4,
    topics: 28,
    questionsGenerated: 45,
    completion: 40,
    status: "draft" as const,
  },
]

const recentActivity = [
  { action: "Generated 20 MCQs for OS Unit 3", time: "2 hours ago", icon: FileQuestion },
  { action: "Uploaded PYP for Data Structures", time: "5 hours ago", icon: FileText },
  { action: "Published Computer Networks syllabus", time: "1 day ago", icon: CheckCircle2 },
  { action: "AI analyzed DS textbook chapters", time: "2 days ago", icon: BarChart3 },
]

const statusConfig = {
  published: { label: "Published", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  draft: { label: "Draft", className: "bg-amber-100 text-amber-700 border-amber-200" },
}

export function TeacherHome({ onAddCourse, onNavigate }: TeacherHomeProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Courses", value: "3", icon: BookOpen, color: "text-primary bg-primary/10" },
          { label: "Questions", value: "269", icon: FileQuestion, color: "text-emerald-600 bg-emerald-50" },
          { label: "Topics Covered", value: "108", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
          { label: "Students", value: "186", icon: Users, color: "text-violet-600 bg-violet-50" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border bg-card p-4"
          >
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Courses */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">My Courses</h2>
            <button
              onClick={onAddCourse}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Course
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {existingCourses.map((course) => {
              const status = statusConfig[course.status]
              return (
                <div
                  key={course.id}
                  className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all hover:shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{course.code}</span>
                      <Badge variant="outline" className={cn("text-[10px] border", status.className)}>
                        {status.label}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-card-foreground">{course.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {course.semester} / {course.units} Units / {course.topics} Topics / {course.questionsGenerated} Questions
                    </p>
                  </div>
                  <div className="flex items-center gap-4 sm:w-48 sm:flex-col sm:items-end">
                    <div className="flex w-full items-center gap-2 sm:justify-end">
                      <Progress value={course.completion} className="h-1.5 flex-1 sm:w-24 sm:flex-initial" />
                      <span className="text-xs font-medium text-muted-foreground">{course.completion}%</span>
                    </div>
                    <button
                      onClick={() => onNavigate("courses")}
                      className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-foreground">Recent Activity</h2>
          <div className="flex flex-col gap-2">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border bg-card p-3"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-card-foreground leading-relaxed">{item.action}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick AI Suggestions */}
      <div className="rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <AlertCircle className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-card-foreground">AI Insights</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            "Computer Networks Unit 3 has low question coverage. Generate more questions?",
            "Data Structures PYP analysis shows 'Trees' is the most asked topic (40%).",
            "OS Unit 5 syllabus alignment needs review. 2 topics unmapped.",
          ].map((insight, i) => (
            <div key={i} className="rounded-lg bg-secondary/60 p-3 text-xs leading-relaxed text-foreground">
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
