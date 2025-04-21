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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Department } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const batchSchema = z.object({
    sessionYear: z.string().regex(/^\d{4}-\d{4}$/, "Session year must be in the format YYYY-YYYY"),
    departmentId: z.string().min(1, "Department is required"),
})

type BatchFormValues = z.infer<typeof batchSchema>

interface BatchFormProps {
    departments: Department[]
    initialData?: {
        sessionYear: string
        departmentId: string
    }
    onSubmit: (data: BatchFormValues) => Promise<void>
}

export function BatchForm({ departments, initialData, onSubmit }: BatchFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<BatchFormValues>({
        resolver: zodResolver(batchSchema),
        defaultValues: initialData || {
            sessionYear: "",
            departmentId: "",
        },
    })

    const handleSubmit = async (data: BatchFormValues) => {
        setIsLoading(true)
        try {
            await onSubmit(data)
            if (!initialData) {
                form.reset()
            }
            router.refresh()
        } catch (error) {
            console.error("Error submitting batch:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{initialData ? "Edit Batch" : "Add New Batch"}</CardTitle>
                <CardDescription>
                    {initialData
                        ? "Update batch information"
                        : "Create a new batch by filling out the form below"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="sessionYear"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Session Year</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 2023-2024" {...field} />
                                    </FormControl>
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
                                            {departments.map((dept) => (
                                                <SelectItem key={dept._id} value={dept._id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                initialData ? "Update Batch" : "Create Batch"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}