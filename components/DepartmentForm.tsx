"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "./ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const departmentSchema = z.object({
    name: z.string().min(1, "Department name is required").max(100, "Department name cannot be more than 100 characters"),
    code: z.string().min(1, "Department code is required").max(10, "Department code cannot be more than 10 characters"),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

interface DepartmentFormProps {
    initialData?: {
        name: string
        code: string
    }
    onSubmit: (data: DepartmentFormValues) => Promise<void>
}

export function DepartmentForm({ initialData, onSubmit }: DepartmentFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(departmentSchema),
        defaultValues: initialData || {
            name: "",
            code: "",
        },
    })

    const handleSubmit = async (data: DepartmentFormValues) => {
        setIsLoading(true)
        try {
            await onSubmit(data)
            if (!initialData) {
                form.reset()
            }
            router.refresh()
        } catch (error) {
            console.error("Error submitting department:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{initialData ? "Edit Department" : "Add New Department"}</CardTitle>
                <CardDescription>
                    {initialData
                        ? "Update department information"
                        : "Create a new department by filling out the form below"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter department name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter department code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {initialData ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                initialData ? "Update Department" : "Create Department"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
} 