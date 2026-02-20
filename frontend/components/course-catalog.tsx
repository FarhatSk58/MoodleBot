"use client"

import { ArrowLeft, BookOpen, Clock, Lock, Users, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CourseCatalogProps {
  onSelectCourse: (courseId: string) => void
  onBack: () => void
}

const courses = [
  {
    id: "cs301",
    code: "CS 301",
    name: "Operating Systems",
    professor: "Dr. Sarah Mitchell",
    topics: 18,
    progress: 35,
    status: "active" as const,
    color: "bg-primary",
    description: "Processes, memory management, file systems, and synchronization.",
  },
  {
    id: "cs201",
    code: "CS 201",
    name: "Data Structures",
    professor: "Dr. James Carter",
    topics: 22,
    progress: 0,
    status: "coming-soon" as const,
    color: "bg-emerald-500",
    description: "Arrays, trees, graphs, sorting, and algorithm complexity.",
  },
  {
    id: "cs302",
    code: "CS 302",
    name: "Computer Networks",
    professor: "Dr. Amina Patel",
    topics: 16,
    progress: 0,
    status: "coming-soon" as const,
    color: "bg-amber-500",
    description: "OSI model, TCP/IP, routing, and network security fundamentals.",
  },
  {
    id: "cs303",
    code: "CS 303",
    name: "Database Systems",
    professor: "Dr. Robert Zhang",
    topics: 20,
    progress: 0,
    status: "coming-soon" as const,
    color: "bg-rose-500",
    description: "SQL, normalization, transactions, indexing, and query optimization.",
  },
  {
    id: "cs401",
    code: "CS 401",
    name: "Machine Learning",
    professor: "Dr. Elena Kowalski",
    topics: 24,
    progress: 0,
    status: "coming-soon" as const,
    color: "bg-violet-500",
    description: "Supervised learning, neural networks, and model evaluation.",
  },
  {
    id: "cs304",
    code: "CS 304",
    name: "Software Engineering",
    professor: "Dr. Michael Brown",
    topics: 15,
    progress: 0,
    status: "coming-soon" as const,
    color: "bg-teal-500",
    description: "Agile, design patterns, testing strategies, and CI/CD pipelines.",
  },
]

export function CourseCatalog({ onSelectCourse, onBack }: CourseCatalogProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Go back to role selection"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-card-foreground">StudyAI</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, Student
          </h1>
          <p className="mt-1 text-muted-foreground">
            Choose a course to start studying.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isActive = course.status === "active"

            return (
              <button
                key={course.id}
                onClick={() => isActive && onSelectCourse(course.id)}
                disabled={!isActive}
                className={cn(
                  "group relative flex flex-col rounded-2xl border bg-card p-5 text-left shadow-sm transition-all duration-200",
                  isActive
                    ? "cursor-pointer hover:-translate-y-1 hover:shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    : "cursor-default opacity-70"
                )}
              >
                {/* Locked overlay */}
                {!isActive && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-card/60 backdrop-blur-[1px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Coming Soon</span>
                    </div>
                  </div>
                )}

                {/* Color bar */}
                <div className={cn("mb-4 h-1.5 w-10 rounded-full", course.color)} />

                {/* Course info */}
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{course.code}</span>
                  {isActive && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-1.5 py-0 font-medium">
                      Active
                    </Badge>
                  )}
                </div>

                <h3 className="mb-1 text-base font-semibold text-card-foreground">
                  {course.name}
                </h3>
                <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                  {course.description}
                </p>

                {/* Meta */}
                <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.professor}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course.topics + " topics"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {isActive ? "In progress" : "Not started"}
                  </span>
                </div>

                {/* Progress */}
                {isActive && (
                  <div className="mt-4 border-t pt-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{course.progress + "%"}</span>
                    </div>
                    <Progress value={course.progress} className="h-1.5" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
