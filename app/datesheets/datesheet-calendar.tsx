"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Define the type for our data
type Exam = {
  id: string
  course: {
    code: string
    name: string
  }
  date: Date
  startTime: string
  endTime: string
  venue: string
  type: "midterm" | "final" | "quiz" | "other"
}

export function DateSheetCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch exams data
  useEffect(() => {
    async function fetchExams() {
      try {
        setLoading(true)
        const response = await fetch("/api/user/exams")

        if (!response.ok) {
          throw new Error("Failed to fetch exams")
        }

        const data = await response.json()

        // Transform the data to match our Exam type
        const formattedExams = data.map((exam: any) => ({
          id: exam._id,
          course: {
            code: exam.courseId.code,
            name: exam.courseId.name,
          },
          date: new Date(exam.date),
          startTime: exam.startTime,
          endTime: exam.endTime,
          venue: exam.venue,
          type: exam.type,
        }))

        setExams(formattedExams)
      } catch (err) {
        console.error("Error fetching exams:", err)
        setError("Failed to load exams. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load exams. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchExams()
  }, [toast])

  // Get exams for the selected date
  const selectedDateExams = exams.filter((exam) => date && exam.date.toDateString() === date.toDateString())

  // Function to highlight dates with exams
  const isDayWithExam = (day: Date) => {
    return exams.some((exam) => exam.date.toDateString() === day.toDateString())
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading exams...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 text-center">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-1">
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              hasExam: isDayWithExam,
            }}
            modifiersStyles={{
              hasExam: {
                fontWeight: "bold",
                backgroundColor: "hsl(var(--brand-100))",
                color: "hsl(var(--brand-900))",
              },
            }}
          />
        </CardContent>
      </Card>
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{date ? date.toLocaleDateString("en-US", { dateStyle: "full" }) : "Select a date"}</CardTitle>
          <CardDescription>
            {selectedDateExams.length
              ? `${selectedDateExams.length} exam${selectedDateExams.length > 1 ? "s" : ""} scheduled`
              : "No exams scheduled for this date"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedDateExams.map((exam) => (
              <div key={exam.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{exam.course.code}</h3>
                  <Badge variant={exam.type === "final" ? "default" : "secondary"}>
                    {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{exam.course.name}</p>
                <div className="mt-2 flex flex-col gap-1 text-sm">
                  <div>
                    Time: {exam.startTime} - {exam.endTime}
                  </div>
                  <div>Venue: {exam.venue}</div>
                </div>
              </div>
            ))}
            {selectedDateExams.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">No exams scheduled for this date</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
