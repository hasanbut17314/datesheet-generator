import Link from "next/link"
import { CalendarRange } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { UserAccountNav } from "@/components/user-account-nav"
import { ModeToggle } from "@/components/mode-toggle"
import type { User } from "@/lib/types"

interface SiteHeaderProps {
  user: User
}

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <CalendarRange className="h-6 w-6 text-brand-600" />
            <span className="inline-block font-bold">Datesheet Generator</span>
          </Link>
          <MainNav userRole={user.role} />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ModeToggle />
            <UserAccountNav user={user} />
          </nav>
        </div>
      </div>
    </header>
  )
}
