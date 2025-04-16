import Link from "next/link"
import { CalendarRange, CheckCircle } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await getServerSession(authOptions)
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <CalendarRange className="h-6 w-6 text-brand-600" />
          <span className="font-bold">Datesheet Generator</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {session ? (
            <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
                Log In
              </Link>
              <Link href="/register" className="text-sm font-medium hover:underline underline-offset-4">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-14">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Streamline Your Exam Scheduling
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Our datesheet generator simplifies the process of creating, managing, and sharing examination
                    schedules for educational institutions.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href={session ? "/dashboard" : "/register"}>
                    <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                      Get Started
                    </Button>
                  </Link>
                  {!session && (
                    <Link href="/login">
                      <Button size="lg" variant="outline">
                        Log In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  alt="Datesheet Generator"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                  src="/placeholder.svg?height=550&width=750"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-14 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform offers a comprehensive set of features to meet the needs of students, faculty, and
                  administrative staff.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <CheckCircle className="h-12 w-12 text-brand-600" />
                <h3 className="text-xl font-bold">Easy Access</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Students can easily access their exam schedules, including dates, times, and locations.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <CheckCircle className="h-12 w-12 text-brand-600" />
                <h3 className="text-xl font-bold">Clash Detection</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Automatically detect and resolve scheduling conflicts to ensure a smooth examination process.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <CheckCircle className="h-12 w-12 text-brand-600" />
                <h3 className="text-xl font-bold">Real-time Updates</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Receive instant notifications about schedule changes or updates.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <CheckCircle className="h-12 w-12 text-brand-600" />
                <h3 className="text-xl font-bold">Automated Scheduling</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Generate optimized exam schedules based on various constraints and requirements.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <CheckCircle className="h-12 w-12 text-brand-600" />
                <h3 className="text-xl font-bold">Faculty Coordination</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Facilitate coordination between faculty members to resolve scheduling conflicts.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <CheckCircle className="h-12 w-12 text-brand-600" />
                <h3 className="text-xl font-bold">Search & Filter</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Easily search and filter exams by various parameters such as date, subject, or course.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Datesheet Generator. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
