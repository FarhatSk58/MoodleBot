"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TeacherHome } from "@/components/teacher/teacher-home"
import { CourseWizard } from "@/components/teacher/course-wizard"
import { QuestionBank } from "@/components/teacher/question-bank"
import { AnalyticsView } from "@/components/teacher/analytics-view"
import { getStoredRole, getStoredToken } from "@/lib/auth"
import { navigationConfig, type TeacherNavKey } from "@/lib/navigation-config"

export default function TeacherPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [view, setView] = useState<TeacherNavKey>("dashboard")
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    const token = getStoredToken()
    const role = getStoredRole()

    if (!token || !role) {
      router.replace("/login")
      return
    }

    if (role !== "teacher") {
      router.replace(role === "student" ? "/student" : "/login")
      return
    }

    setAllowed(true)
  }, [router])

  if (!allowed) {
    return null
  }

  return (
    <DashboardLayout
      role="teacher"
      navItems={navigationConfig.teacher}
      activeView={view}
      onNavigate={(next) => setView(next as TeacherNavKey)}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row">
        <section className="flex-1 lg:pr-6">
          {view === "dashboard" && (
            <TeacherHome
              onAddCourse={() => setShowWizard(true)}
              onNavigate={(next) => setView(next as TeacherNavKey)}
            />
          )}

          {view === "courses" && (
            <div className="rounded-xl border bg-card p-6">Courses view (placeholder)</div>
          )}

          {view === "question-bank" && <QuestionBank />}

          {view === "ai-tools" && (
            <div className="rounded-xl border bg-card p-6">AI Tools (placeholder)</div>
          )}

          {view === "analytics" && <AnalyticsView />}

          {view === "settings" && (
            <div className="rounded-xl border bg-card p-6">Open settings from the top-right profile menu.</div>
          )}
        </section>

        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-card-foreground">AI Assistant</h3>
              <p className="mt-2 text-xs text-muted-foreground">AI-generated suggestions will appear here.</p>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <h3 className="text-sm font-semibold text-card-foreground">Quick Actions</h3>
              <div className="mt-3 flex flex-col gap-2">
                <button className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Create Quiz</button>
                <button className="rounded-lg border px-3 py-2 text-sm font-medium">Map Topics</button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-4xl rounded-xl bg-background shadow-lg">
            <CourseWizard onClose={() => setShowWizard(false)} />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
