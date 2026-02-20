"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import type { UserRole } from "@/lib/auth"
import type { NavigationItem, NavKey } from "@/lib/navigation-config"
import { cn } from "@/lib/utils"
import { UserMenu } from "@/components/dashboard/user-menu"

interface DashboardLayoutProps {
  role: UserRole
  navItems: NavigationItem[]
  activeView: NavKey
  onNavigate: (view: NavKey) => void
  children: React.ReactNode
}

export function DashboardLayout({ role, navItems, activeView, onNavigate, children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const activeLabel = navItems.find((item) => item.id === activeView)?.label ?? "Dashboard"

  return (
    <div className="flex h-screen w-full bg-background">
      <aside
        className={cn(
          "flex h-full flex-col border-r bg-card transition-all duration-200",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex items-center gap-3 border-b px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {role === "teacher" ? "TR" : "ST"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-card-foreground">{role === "teacher" ? "Teacher" : "Student"}</p>
              <p className="truncate text-xs text-muted-foreground">Dashboard</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-3">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    collapsed && "justify-center px-0",
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

        <div className="border-t px-2 py-3">
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
        </div>
      </aside>

      <main className="relative flex flex-1 flex-col overflow-auto">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-6 py-3 backdrop-blur">
          <h1 className="text-lg font-semibold text-foreground">{activeLabel}</h1>
          <UserMenu role={role} />
        </div>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  )
}
