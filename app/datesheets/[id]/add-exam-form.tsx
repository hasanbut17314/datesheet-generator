"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Define types for our data
type Course = {
  id: string;
  code: string;
  name: string;
};

type Venue = {
  id: string;
  name: string;
};

type DateSheet = {
  id: string;
  startDate: Date;
  endDate: Date;
};

type Faculty = {
  id: string;
  name: string;
};

interface AddExamFormProps {
  dateSheetId: string;
}

const examSchema = z
  .object({
    course: z.string().min(1, "Please select a course.").regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID"),
    date: z.date({ required_error: "Date is required." }),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    venue: z.string().min(1, "Please select a venue."),
    type: z.enum(["midterm", "final", "quiz", "other"], {
      required_error: "Please select an exam type.",
    }),
    faculty: z.string().min(1, "Please select a faculty member.").regex(/^[0-9a-fA-F]{24}$/, "Invalid faculty ID"),
    roomCapacity: z.number().min(1, "Room capacity must be at least 1"),
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    maxStudents: z.number().min(1, "Maximum students must be at least 1"),
    isOnline: z.boolean(),
    requiredResources: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export function AddExamForm({ dateSheetId }: AddExamFormProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [datesheet, setDatesheet] = useState<DateSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const datesheetResponse = await fetch(`/api/datesheets/${dateSheetId}`);
        if (!datesheetResponse.ok) {
          throw new Error("Failed to fetch datesheet");
        }
        const datesheetData = await datesheetResponse.json();
        setDatesheet({
          id: datesheetData._id,
          startDate: new Date(datesheetData.startDate),
          endDate: new Date(datesheetData.endDate),
        });

        const coursesResponse = await fetch("/api/courses");
        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses");
        }
        const coursesData = await coursesResponse.json();
        setCourses(
          coursesData.map((course: any) => ({
            id: course._id,
            code: course.code,
            name: course.name,
          })),
        );

        const facultiesResponse = await fetch("/api/users?role=faculty");
        if (!facultiesResponse.ok) {
          throw new Error("Failed to fetch faculties");
        }
        const facultiesData = await facultiesResponse.json();
        setFaculties(
          facultiesData.map((faculty: any) => ({
            id: faculty._id,
            name: faculty.name,
          })),
        );

        setVenues([
          { id: "hall-a", name: "Hall A" },
          { id: "hall-b", name: "Hall B" },
          { id: "hall-c", name: "Hall C" },
          { id: "hall-d", name: "Hall D" },
          { id: "lab-101", name: "Lab 101" },
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast({
          title: "Error",
          description: "Failed to load form data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dateSheetId, toast]);

  const form = useForm<z.infer<typeof examSchema>>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      type: "final",
      isOnline: false,
      requiredResources: [],
      prerequisites: [],
      notes: "",
      roomCapacity: 1,
      duration: 60,
      maxStudents: 1,
    },
  });

  async function onSubmit(values: z.infer<typeof examSchema>) {
    try {
      setSubmitting(true);

      const data = {
        courseId: values.course,
        dateSheetId,
        date: values.date.toISOString(),
        startTime: values.startTime,
        endTime: values.endTime,
        venue: values.venue,
        type: values.type,
        facultyId: values.faculty,
        roomCapacity: values.roomCapacity,
        duration: values.duration,
        maxStudents: values.maxStudents,
        isOnline: values.isOnline,
        requiredResources: values.requiredResources || [],
        prerequisites: values.prerequisites || [],
        notes: values.notes || "",
      };

      const response = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to create exam",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Exam has been added to the datesheet.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading form data...</span>
      </div>
    );
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
        <FormField
          control={form.control}
          name="faculty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faculty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a faculty member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select the faculty member for this exam.</FormDescription>
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
                        if (!datesheet) return true;
                        return date < datesheet.startDate || date > datesheet.endDate;
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
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="roomCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    min={1}
                  />
                </FormControl>
                <FormDescription>The maximum number of seats in the venue.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxStudents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Students</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    min={1}
                  />
                </FormControl>
                <FormDescription>The maximum number of students allowed.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  min={1}
                />
              </FormControl>
              <FormDescription>The duration of the exam in minutes.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isOnline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Online Exam</FormLabel>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>Check if the exam is conducted online.</FormDescription>
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
                <Input {...field} />
              </FormControl>
              <FormDescription>Additional notes for the exam (max 500 characters).</FormDescription>
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
  );
}