"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createDateSheet } from "@/app/actions/datesheets"
import { getDepartments } from "@/app/actions/departments"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Department } from "@/lib/types"

const dateSheetSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name cannot be more than 100 characters"),
    departmentId: z.string().min(1, "Department is required"),
    semester: z.number().min(1, "Semester is required").max(8, "Semester cannot be more than 8"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
})

type DateSheetFormValues = z.infer<typeof dateSheetSchema>

export function CreateDateSheetForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [departments, setDepartments] = useState<Department[]>([])
    const router = useRouter()

    useEffect(() => {
        const fetchDepartments = async () => {
            const data = await getDepartments()
            setDepartments(data)
        }
        fetchDepartments()
    }, [])

    const form = useForm<DateSheetFormValues>({
        resolver: zodResolver(dateSheetSchema),
        defaultValues: {
            name: "",
            departmentId: "",
            semester: 1,
            startDate: "",
            endDate: "",
        },
    })

    const handleSubmit = async (data: DateSheetFormValues) => {
        setIsLoading(true)
        try {
            const dateSheetData = {
                name: data.name,
                departmentId: data.departmentId,
                semester: data.semester,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: "draft" as const,
                exams: []
            }
            await createDateSheet(dateSheetData)
            form.reset()
            router.refresh()
        } catch (error) {
            console.error("Failed to create date sheet:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Date Sheet</CardTitle>
                <CardDescription>Create a new date sheet for examinations.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter date sheet name" {...field} />
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
                                                <SelectValue placeholder="Select department" />
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="semester"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semester</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={8}
                                            placeholder="Enter semester"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Start Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>End Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Date Sheet
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
} 