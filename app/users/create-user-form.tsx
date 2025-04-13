"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createUser } from "@/app/actions/user-actions"

// Define types for our data
type Department = {
    id: string
    name: string
}

const userSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    role: z.enum(["student", "faculty", "admin"], {
        required_error: "Please select a role.",
    }),
    departmentId: z.string().optional(),
})

export function CreateUserForm() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const { toast } = useToast()

    // Fetch departments data
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
    }, [toast])

    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "student",
        },
    })

    const watchRole = form.watch("role")

    async function onSubmit(values: z.infer<typeof userSchema>) {
        try {
            setSubmitting(true)

            const formData = new FormData()
            formData.append("name", values.name)
            formData.append("email", values.email)
            formData.append("password", values.password)
            formData.append("role", values.role)
            if (values.departmentId) {
                formData.append("departmentId", values.departmentId)
            }

            const result = await createUser(formData)

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
                description: "User created successfully.",
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
                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormDescription>Enter the user's full name.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="john.doe@example.com" type="email" {...field} />
                                </FormControl>
                                <FormDescription>Enter the user's email address.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="••••••••" type="password" {...field} />
                                </FormControl>
                                <FormDescription>Enter a secure password (min. 8 characters).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="faculty">Faculty</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>Select the user's role in the system.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {(watchRole === "student" || watchRole === "faculty") && (
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
                                <FormDescription>Select the user's department.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <Button type="submit" disabled={submitting}>
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating User...
                        </>
                    ) : (
                        "Create User"
                    )}
                </Button>
            </form>
        </Form>
    )
}
