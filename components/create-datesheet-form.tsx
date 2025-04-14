"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { getDepartments } from "@/app/actions/departments"
import { useEffect, useState } from "react"
import { Department } from "@/lib/types"

const formSchema = z.object({
  name: z.string().min(5, {
    message: "Name must be at least 5 characters.",
  }),
  departmentId: z.string({
    required_error: "Please select a department.",
  }),
  semester: z.coerce.number().int().min(1).max(8),
  academicYear: z.string({
    required_error: "Please provide academic year.",
  }),
  examPeriod: z.enum(["Mid", "Final"], {
    required_error: "Please select exam period.",
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
  notes: z.string().max(1000).optional(),
  examTimings: z.object({
    morningStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    morningEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    afternoonStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    afternoonEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  }),
  constraints: z.object({
    minGapBetweenExams: z.number().min(1).max(24),
    maxExamsPerDay: z.number().min(1).max(4),
    preferredDays: z.array(z.string()),
    blackoutDates: z.array(z.date()),
    maxExamsPerStudentPerDay: z.number().min(1).max(2),
    maxExamsPerFacultyPerDay: z.number().min(1).max(2),
    minGapBetweenSameFacultyExams: z.number().min(1).max(72),
    minGapBetweenSameStudentExams: z.number().min(1).max(72),
  }),
})

export function CreateDateSheetForm() {
  const { toast } = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments()
        setDepartments(data)
      } catch (error) {
        console.error("Failed to fetch departments:", error)
        toast({
          title: "Error",
          description: "Failed to load departments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDepartments()
  }, [toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      departmentId: "",
      semester: 1,
      academicYear: "",
      examPeriod: "Mid",
      notes: "",
      examTimings: {
        morningStart: "09:00",
        morningEnd: "12:00",
        afternoonStart: "14:00",
        afternoonEnd: "17:00",
      },
      constraints: {
        minGapBetweenExams: 2,
        maxExamsPerDay: 2,
        preferredDays: [],
        blackoutDates: [],
        maxExamsPerStudentPerDay: 1,
        maxExamsPerFacultyPerDay: 1,
        minGapBetweenSameFacultyExams: 24,
        minGapBetweenSameStudentExams: 24,
      },
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/datesheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to create datesheet")
      }

      toast({
        title: "Success",
        description: "Datesheet created successfully.",
      })

      form.reset()
    } catch (error) {
      console.error("Error creating datesheet:", error)
      toast({
        title: "Error",
        description: "Failed to create datesheet. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="ml-2">Loading departments...</span>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter datesheet name" {...field} />
                </FormControl>
                <FormDescription>Give your datesheet a descriptive name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department._id} value={department._id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Select the department for this datesheet.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={8} placeholder="1" {...field} />
                </FormControl>
                <FormDescription>Enter the semester number (1-8).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="academicYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Year</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2023-2024" {...field} />
                </FormControl>
                <FormDescription>Enter the academic year.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="examPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Period</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mid">Mid Term</SelectItem>
                    <SelectItem value="Final">Final Term</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Select the exam period.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter any additional notes..." {...field} />
                </FormControl>
                <FormDescription>Add any important notes or instructions.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
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
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>The start date of the examination period.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
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
                      disabled={(date) =>
                        date < new Date(form.getValues("startDate") || new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>The end date of the examination period.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Exam Timings</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="examTimings.morningStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Morning Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="examTimings.morningEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Morning End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="examTimings.afternoonStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Afternoon Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="examTimings.afternoonEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Afternoon End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Scheduling Constraints</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="constraints.minGapBetweenExams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Gap Between Exams (hours)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={24} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="constraints.maxExamsPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Exams Per Day</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="constraints.maxExamsPerStudentPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Exams Per Student Per Day</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="constraints.maxExamsPerFacultyPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Exams Per Faculty Per Day</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="constraints.minGapBetweenSameFacultyExams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Gap Between Same Faculty Exams (hours)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={72} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="constraints.minGapBetweenSameStudentExams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Gap Between Same Student Exams (hours)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={72} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preferred Days</h3>
          <div className="grid gap-4 md:grid-cols-7">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
              <FormField
                key={day}
                control={form.control}
                name="constraints.preferredDays"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(day)}
                        onCheckedChange={(checked) => {
                          const current = field.value || []
                          if (checked) {
                            field.onChange([...current, day])
                          } else {
                            field.onChange(current.filter((d) => d !== day))
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{day}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Blackout Dates</h3>
          <FormField
            control={form.control}
            name="constraints.blackoutDates"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Select dates to exclude</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value?.length && "text-muted-foreground")}
                      >
                        {field.value?.length
                          ? `${field.value.length} date${field.value.length === 1 ? "" : "s"} selected`
                          : "Select dates"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="multiple"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(form.getValues("startDate") || new Date().setHours(0, 0, 0, 0)) ||
                        date > new Date(form.getValues("endDate") || new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Select dates that should be excluded from the exam schedule.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Create Datesheet</Button>
      </form>
    </Form>
  )
}
