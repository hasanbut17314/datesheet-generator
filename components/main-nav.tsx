"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { UserRole } from "@/lib/types"
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  Settings,
  Building2
} from "lucide-react"

interface NavItem {
  title: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["student", "admin", "faculty"],
  },
  {
    title: "Datesheets",
    path: "/datesheets",
    icon: Calendar,
    roles: ["student", "admin", "faculty"],
  },
  {
    title: "Departments",
    path: "/departments",
    icon: Building2,
    roles: ["admin"],
  },
  {
    title: "Courses",
    path: "/courses",
    icon: BookOpen,
    roles: ["admin", "faculty"],
  },
  {
    title: "Users",
    path: "/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
    roles: ["student", "admin", "faculty"],
  },
]

interface MainNavProps {
  userRole: UserRole
}

export function MainNav({ userRole }: MainNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems
        .filter((item) => item.roles.includes(userRole))
        .map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                pathname === item.path ? "text-primary" : "text-muted-foreground"
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
