"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, FileText, Home, Settings, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/types"

interface MainNavProps {
  userRole: UserRole
}

export function MainNav({ userRole }: MainNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["student", "admin", "faculty"],
    },
    {
      title: "Datesheets",
      href: "/datesheets",
      icon: CalendarDays,
      roles: ["student", "admin", "faculty"],
    },
    {
      title: "Courses",
      href: "/courses",
      icon: FileText,
      roles: ["admin", "faculty"],
    },
    {
      title: "Users",
      href: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["student", "admin", "faculty"],
    },
  ]

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {filteredNavItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
