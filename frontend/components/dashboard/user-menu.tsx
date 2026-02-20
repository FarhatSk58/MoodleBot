"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { clearAuthSession, AUTH_STORAGE_KEYS, type UserRole } from "@/lib/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
  role: UserRole
}

function initials(name: string) {
  const source = name.trim()
  if (!source) return "U"
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function UserMenu({ role }: UserMenuProps) {
  const router = useRouter()
  const [openProfile, setOpenProfile] = useState(false)

  const name = useMemo(() => {
    if (typeof window === "undefined") return "User"
    return localStorage.getItem(AUTH_STORAGE_KEYS.name) ?? "User"
  }, [])

  const handleLogout = () => {
    clearAuthSession()
    router.replace("/login")
  }

  return (
    <>
      <div className="flex items-center">
        <DropdownMenu open={openProfile} onOpenChange={setOpenProfile}>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-full ring-offset-background transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Open profile menu"
            >
              <Avatar className="h-9 w-9 border">
                <AvatarFallback>{initials(name)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <div className="px-2 pb-2 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{name}</p>
              <p>{role === "teacher" ? "Teacher" : "Student"}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
