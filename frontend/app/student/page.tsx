"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { StudentDashboard } from "@/components/student/student-dashboard"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getStoredRole, getStoredToken } from "@/lib/auth"
import { navigationConfig, type StudentNavKey } from "@/lib/navigation-config"

export default function StudentPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [view, setView] = useState<StudentNavKey>("dashboard")

  useEffect(() => {
    const token = getStoredToken()
    const role = getStoredRole()

    if (!token || !role) {
      router.replace("/login")
      return
    }

    if (role !== "student") {
      router.replace(role === "teacher" ? "/teacher" : "/login")
      return
    }

    setAllowed(true)
  }, [router])

  if (!allowed) {
    return null
  }

  return (
    <DashboardLayout
      role="student"
      navItems={navigationConfig.student}
      activeView={view}
      onNavigate={(next) => setView(next as StudentNavKey)}
    >
      <StudentDashboard activeView={view} onNavigate={setView} />
    </DashboardLayout>
  )
}
