import type { UserRole } from "@/lib/auth"
import {
  BarChart3,
  BookOpen,
  FileQuestion,
  LayoutDashboard,
  RefreshCw,
  Settings,
  ShieldQuestion,
  Sparkles,
} from "lucide-react"

export type StudentNavKey = "dashboard" | "courses" | "practice" | "revision" | "analytics" | "settings"
export type TeacherNavKey = "dashboard" | "courses" | "question-bank" | "ai-tools" | "analytics" | "settings"
export type NavKey = StudentNavKey | TeacherNavKey

export interface NavigationItem {
  id: NavKey
  label: string
  icon: React.ElementType
}

export const navigationConfig: Record<UserRole, NavigationItem[]> = {
  student: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "practice", label: "Practice Tests", icon: ShieldQuestion },
    { id: "revision", label: "Revision", icon: RefreshCw },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ],
  teacher: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "question-bank", label: "Question Bank", icon: FileQuestion },
    { id: "ai-tools", label: "AI Tools", icon: Sparkles },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ],
}
