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
  Building2,
  Menu,
  X
} from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop navigation */}
      <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {filteredNavItems.map((item) => {
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

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <nav className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
          <div className="container py-4">
            <div className="flex flex-col space-y-4">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center text-sm font-medium transition-colors hover:text-primary",
                      pathname === item.path ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      )}
    </>
  )
}
