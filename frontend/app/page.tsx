import { redirect } from "next/navigation"

export default function Page() {
  // Root should send users to the login page first.
  redirect("/login")
}
