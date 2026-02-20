"use client"

import { GraduationCap, BookOpen, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoleSelectionProps {
  onSelectRole: (role: "student" | "teacher") => void
}

const roles = [
  {
    id: "student" as const,
    title: "Student",
    description: "Access your courses, study with AI, and practice with quizzes tailored to your syllabus.",
    icon: GraduationCap,
    features: ["Interactive lessons", "AI-powered study assistant", "Practice quizzes & flashcards"],
  },
  {
    id: "teacher" as const,
    title: "Teacher",
    description: "Upload course materials, manage your courses, and track student engagement.",
    icon: BookOpen,
    features: ["Upload PDFs & documents", "Organize by course", "Manage course content"],
  },
]

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Branding */}
      <div className="mb-12 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            StudyAI
          </h1>
        </div>
        <p className="text-balance text-muted-foreground">
          Your intelligent learning companion. Choose how you want to get started.
        </p>
      </div>

      {/* Role Cards */}
      <div className="flex w-full max-w-2xl flex-col gap-6 sm:flex-row">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            className={cn(
              "group flex flex-1 flex-col items-start rounded-2xl border bg-card p-6 text-left shadow-sm",
              "transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-primary/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <role.icon className="h-6 w-6" />
            </div>

            <h2 className="mb-1 text-xl font-semibold text-card-foreground">
              {role.title}
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              {role.description}
            </p>

            <ul className="mb-6 flex flex-col gap-2">
              {role.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-auto w-full rounded-lg bg-primary/10 py-2 text-center text-sm font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              {"Continue as " + role.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
