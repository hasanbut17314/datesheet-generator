"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Sample data
const exams = [
  {
    id: "1",
    course: "Introduction to Computer Science",
    code: "CS101",
    date: "2023-12-15",
    time: "09:00 - 11:00",
  },
  {
    id: "2",
    course: "Calculus II",
    code: "MATH201",
    date: "2023-12-18",
    time: "13:00 - 15:00",
  },
  {
    id: "3",
    course: "Physics I",
    code: "PHY101",
    date: "2023-12-20",
    time: "10:00 - 12:00",
  },
  {
    id: "4",
    course: "Data Structures",
    code: "CS201",
    date: "2023-12-22",
    time: "14:00 - 16:00",
  },
  {
    id: "5",
    course: "Database Systems",
    code: "CS301",
    date: "2023-12-25",
    time: "09:00 - 11:00",
  },
]

const formSchema = z.object({
  exam1: z.string({
    required_error: "Please select the first exam.",
  }),
  exam2: z.string({
    required_error: "Please select the second exam.",
  }),
  description: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters.",
    })
    .max(500, {
      message: "Description must not be longer than 500 characters.",
    }),
})

export function ReportClashDialog() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would submit this to your API
    console.log(values)

    toast({
      title: "Clash reported",
      description: "Your exam clash has been reported successfully.",
    })

    form.reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Report Exam Clash</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Exam Clash</DialogTitle>
          <DialogDescription>
            If you have two exams scheduled at the same time, please report it here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="exam1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Exam</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an exam" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.code} - {exam.date} ({exam.time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exam2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Second Exam</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an exam" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.code} - {exam.date} ({exam.time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Please provide additional details about the clash..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide any additional information that might help resolve the clash.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Submit Report</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
