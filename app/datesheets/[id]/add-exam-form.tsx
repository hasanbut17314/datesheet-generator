"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { createExam } from "@/app/actions/exam-actions"

// Define types for our data
type Course = {
  id: string
  code: string
  name: string
}

type Venue = {
  id: string
  name: string
}

type DateSheet = {
  id: string
  startDate: Date
  endDate: Date
}

interface AddExamFormProps {
  dateSheetId: string
}

const examSchema = z.object({
  course: z.string({
    required_error: "Please select a course.",
  }),
  date: z.date({
    required_error: "Date is required.",
  }),
  startTime: z.string({
    required_error: "Start time is required.",
  }),
  endTime: z.string({
    required_error: "End time is required.",
  }),
  venue: z.string({
    required_error: "Please select a venue.",
  }),
  type: z.enum(["midterm", "final", "quiz", "other"], {
    required_error: "Please select an exam type.",
  }),
})

export function AddExamForm({ dateSheetId }: AddExamFormProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [datesheet, setDatesheet] = useState<DateSheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch courses and venues data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch datesheet to get date range
        const datesheetResponse = await fetch(`/api/datesheets/${dateSheetId}`)
        if (!datesheetResponse.ok) {
          throw new Error("Failed to fetch datesheet")
        }
        const datesheetData = await datesheetResponse.json()
        setDatesheet({
          id: datesheetData._id,
          startDate: new Date(datesheetData.startDate),
          endDate: new Date(datesheetData.endDate),
        })

        // Fetch courses
        const coursesResponse = await fetch("/api/courses")
        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses")
        }
        const coursesData = await coursesResponse.json()
        setCourses(
          coursesData.map((course: any) => ({
            id: course._id,
            code: course.code,
            name: course.name,
          })),
        )

        // Fetch venues (or use a predefined list if no API endpoint exists)
        // For now, we'll use a predefined list
        setVenues([
          { id: "hall-a", name: "Hall A" },
          { id: "hall-b", name: "Hall B" },
          { id: "hall-c", name: "Hall C" },
          { id: "hall-d", name: "Hall D" },
          { id: "lab-101", name: "Lab 101" },
        ])
      } catch (err) {
        console.error("Error fetching data:", err)
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateSheetId, toast])

  const form = useForm<z.infer<typeof examSchema>>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      type: "final",
    },
  })

  async function onSubmit(values: z.infer<typeof examSchema>) {
    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append("course", values.course)
      formData.append("dateSheetId", dateSheetId)
      formData.append("date", values.date.toISOString())
      formData.append("startTime", values.startTime)
      formData.append("endTime", values.endTime)
      formData.append("venue", values.venue)
      formData.append("type", values.type)

      const result = await createExam(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Exam has been added to the datesheet.",
      })

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading form data...</span>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="course"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the course for this exam.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => {
                        // Disable dates outside the datesheet range
                        if (!datesheet) return true
                        return date < datesheet.startDate || date > datesheet.endDate
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>The date of the exam (must be within the datesheet period).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="midterm">Midterm</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Select the type of exam.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormDescription>The start time of the exam.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormDescription>The end time of the exam.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="venue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Venue</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a venue" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the venue for this exam.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Exam...
            </>
          ) : (
            "Add Exam"
          )}
        </Button>
      </form>
    </Form>
  )
}
