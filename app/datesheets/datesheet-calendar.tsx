"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Sample data
const exams = [
  {
    id: "1",
    course: "Introduction to Computer Science",
    code: "CS101",
    date: new Date("2023-12-15"),
    startTime: "09:00",
    endTime: "11:00",
    venue: "Hall A",
    type: "final",
  },
  {
    id: "2",
    course: "Calculus II",
    code: "MATH201",
    date: new Date("2023-12-18"),
    startTime: "13:00",
    endTime: "15:00",
    venue: "Hall B",
    type: "final",
  },
  {
    id: "3",
    course: "Physics I",
    code: "PHY101",
    date: new Date("2023-12-20"),
    startTime: "10:00",
    endTime: "12:00",
    venue: "Hall C",
    type: "final",
  },
  {
    id: "4",
    course: "Data Structures",
    code: "CS201",
    date: new Date("2023-12-22"),
    startTime: "14:00",
    endTime: "16:00",
    venue: "Hall A",
    type: "final",
  },
  {
    id: "5",
    course: "Database Systems",
    code: "CS301",
    date: new Date("2023-12-25"),
    startTime: "09:00",
    endTime: "11:00",
    venue: "Hall D",
    type: "final",
  },
]

export function DateSheetCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Get exams for the selected date
  const selectedDateExams = exams.filter((exam) => date && exam.date.toDateString() === date.toDateString())

  // Function to highlight dates with exams
  const isDayWithExam = (day: Date) => {
    return exams.some((exam) => exam.date.toDateString() === day.toDateString())
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
                  <h3 className="font-semibold">{exam.code}</h3>
                  <Badge variant={exam.type === "final" ? "default" : "secondary"}>
                    {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{exam.course}</p>
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
