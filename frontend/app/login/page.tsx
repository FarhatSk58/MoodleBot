"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getApiBaseUrl, setAuthSession, type UserRole } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data?.message ?? "Login failed")
        return
      }

      const role = data?.role as UserRole
      const token = data?.token as string
      const name = (data?.name as string) ?? ""

      if (!token || (role !== "student" && role !== "teacher")) {
        setError("Invalid login response from server")
        return
      }

      setAuthSession(token, role, name)
      router.push(role === "teacher" ? "/teacher" : "/student")
    } catch {
      setError("Could not connect to server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-semibold text-primary-foreground">SA</span>
          </div>
          <h1 className="text-lg font-semibold text-card-foreground">Welcome back</h1>
          <p className="mt-1 text-xs text-muted-foreground">Sign in to your teacher or student account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="mt-1"
              required
            />
          </div>

          <Button type="submit" className="mt-1" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>

        <div className="mt-4 flex items-center justify-between text-xs">
          <Link href="/signup" className="text-primary text-sm hover:underline">
            Sign up
          </Link>
          <Link href="/request-teacher-access" className="text-muted-foreground hover:underline">
            Request Teacher Access
          </Link>
        </div>
      </div>
    </div>
  )
}
