import type React from "react"
import { SiteHeader } from "@/components/site-header"
import type { User } from "@/lib/types"

interface DashboardShellProps {
  user: User
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={user} />
      <main className="flex-1 container py-6">{children}</main>
    </div>
  )
}
