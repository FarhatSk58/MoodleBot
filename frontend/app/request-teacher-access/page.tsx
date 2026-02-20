"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function RequestTeacherAccess() {
  const router = useRouter()
  const [institution, setInstitution] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Placeholder: submit request
    setTimeout(() => {
      setLoading(false)
      router.push('/login')
    }, 800)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-md">
        <h1 className="mb-2 text-lg font-semibold text-card-foreground">Request Teacher Access</h1>
        <p className="mb-4 text-xs text-muted-foreground">Provide institution details and a short justification.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="institution">Institution / Department</Label>
            <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} className="mt-1" required />
          </div>

          <div>
            <Label htmlFor="reason">Why do you need teacher access?</Label>
            <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 min-h-[100px] w-full rounded-md border border-input px-3 py-2 text-sm" required />
          </div>

          <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Request Access'}</Button>
        </form>
      </div>
    </div>
  )
}
