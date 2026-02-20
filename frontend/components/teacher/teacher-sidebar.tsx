"use client"

import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type TeacherView =
  | "dashboard"
  | "courses"
  | "question-bank"
  | "ai-tools"
  | "analytics"
  | "settings"

interface TeacherSidebarProps {
  currentView: TeacherView
  onNavigate: (view: TeacherView) => void
  onBack: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const navItems: { id: TeacherView; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "question-bank", label: "Question Bank", icon: FileQuestion },
  { id: "ai-tools", label: "AI Tools", icon: Sparkles },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
]

export function TeacherSidebar({
  currentView,
  onNavigate,
  onBack,
  collapsed,
  onToggleCollapse,
}: TeacherSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Profile Header */}
      <div className="flex items-center gap-3 border-b px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          DR
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-card-foreground">Dr. Ramesh K.</p>
            <p className="truncate text-xs text-muted-foreground">Computer Science</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-3">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t px-2 py-3">
        <button
          onClick={onToggleCollapse}
          className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="mx-auto h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
        <button
          onClick={onBack}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-0"
          )}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
