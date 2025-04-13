"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { updateCourse } from "@/app/actions/course-actions"

// Define types for our data
type Department = {
    id: string
    name: string
}

type Faculty = {
    id: string
    name: string
    email: string
}

type Course = {
    id: string
    code: string
    name: string
    department: {
        id: string
        name: string
    }
    faculty: {
        id: string
        name: string
        email: string
    }
    semester: number
    creditHours: number
}

interface EditCourseDialogProps {
    course: Course
    open: boolean
    onOpenChange: (open: boolean) => void
    onCourseUpdated: (course: Course) => void
}

const courseSchema = z.object({
    code: z.string().min(2, {
        message: "Course code must be at least 2 characters.",
    }),
    name: z.string().min(3, {
        message: "Course name must be at least 3 characters.",
    }),
    departmentId: z.string({
        required_error: "Please select a department.",
    }),
    facultyId: z.string({
        required_error: "Please select a faculty member.",
    }),
    semester: z.coerce.number().int().min(1).max(8),
    creditHours: z.coerce.number().min(1).max(6),
})

export function EditCourseDialog({ course, open, onOpenChange, onCourseUpdated }: EditCourseDialogProps) {
    const [departments, setDepartments] = useState<Department[]>([])
    const [faculty, setFaculty] = useState<Faculty[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const { toast } = useToast()

    // Fetch departments and faculty data
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)

                // Fetch departments
                const departmentsResponse = await fetch("/api/departments")
                if (!departmentsResponse.ok) {
                    throw new Error("Failed to fetch departments")
                }
                const departmentsData = await departmentsResponse.json()
                setDepartments(
                    departmentsData.map((dept: any) => ({
                        id: dept._id,
                        name: dept.name,
                    })),
                )

                // Fetch faculty (users with role faculty)
                const facultyResponse = await fetch("/api/users?role=faculty")
                if (!facultyResponse.ok) {
                    throw new Error("Failed to fetch faculty")
                }
                const facultyData = await facultyResponse.json()
                setFaculty(
                    facultyData.map((f: any) => ({
                        id: f._id,
                        name: f.name,
                        email: f.email,
                    })),
                )
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

        if (open) {
            fetchData()
        }
    }, [open, toast])

    const form = useForm<z.infer<typeof courseSchema>>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            code: course.code,
            name: course.name,
            departmentId: course.department.id,
            facultyId: course.faculty.id,
            semester: course.semester,
            creditHours: course.creditHours,
        },
    })

    async function onSubmit(values: z.infer<typeof courseSchema>) {
        try {
            setSubmitting(true)

            const formData = new FormData()
            formData.append("id", course.id)
            formData.append("code", values.code)
            formData.append("name", values.name)
            formData.append("departmentId", values.departmentId)
            formData.append("facultyId", values.facultyId)
            formData.append("semester", values.semester.toString())
            formData.append("creditHours", values.creditHours.toString())

            const result = await updateCourse(formData)

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
                description: "Course updated successfully.",
            })

            // Update the course in the parent component
            onCourseUpdated({
                ...course,
                code: values.code,
                name: values.name,
                department: {
                    id: values.departmentId,
                    name: departments.find((d) => d.id === values.departmentId)?.name || course.department.name,
                },
                faculty: {
                    id: values.facultyId,
                    name: faculty.find((f) => f.id === values.facultyId)?.name || course.faculty.name,
                    email: faculty.find((f) => f.id === values.facultyId)?.email || course.faculty.email,
                },
                semester: values.semester,
                creditHours: values.creditHours,
            })
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Course</DialogTitle>
                    <DialogDescription>Update the course details. Click save when you're done.</DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex h-48 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2">Loading form data...</span>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="CS101" {...field} />
                                            </FormControl>
                                            <FormDescription>Enter a unique code for the course.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Introduction to Computer Science" {...field} />
                                            </FormControl>
                                            <FormDescription>Enter the full name of the course.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
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
                                                        <SelectItem key={department.id} value={department.id}>
                                                            {department.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Select the department this course belongs to.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="facultyId"
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
                                                    {faculty.map((f) => (
                                                        <SelectItem key={f.id} value={f.id}>
                                                            {f.name} ({f.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Select the faculty member teaching this course.</FormDescription>
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
                                                <Input type="number" min={1} max={8} {...field} />
                                            </FormControl>
                                            <FormDescription>Enter the semester number (1-8).</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="creditHours"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Credit Hours</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={1} max={6} {...field} />
                                            </FormControl>
                                            <FormDescription>Enter the number of credit hours (1-6).</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
