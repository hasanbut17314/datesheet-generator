"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { IDateSheet } from "@/models/DateSheet"

const constraintsSchema = z.object({
    minGapBetweenExams: z.coerce.number().min(0).max(24),
    maxExamsPerDay: z.coerce.number().min(1).max(4),
    preferredDays: z.array(z.string()),
    blackoutDates: z.array(z.date()),
    maxExamsPerStudentPerDay: z.coerce.number().min(1).max(2),
    maxExamsPerFacultyPerDay: z.coerce.number().min(1).max(2),
    minGapBetweenSameFacultyExams: z.coerce.number().min(1).max(72),
    minGapBetweenSameStudentExams: z.coerce.number().min(1).max(72)
})

export function DateSheetConstraints({ dateSheet }: { dateSheet: IDateSheet }) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof constraintsSchema>>({
        resolver: zodResolver(constraintsSchema),
        defaultValues: {
            minGapBetweenExams: dateSheet.constraints?.minGapBetweenExams || 2,
            maxExamsPerDay: dateSheet.constraints?.maxExamsPerDay || 2,
            preferredDays: dateSheet.constraints?.preferredDays || [],
            blackoutDates: dateSheet.constraints?.blackoutDates?.map((date: any) => new Date(date)) || [],
            maxExamsPerStudentPerDay: dateSheet.constraints?.maxExamsPerStudentPerDay || 1,
            maxExamsPerFacultyPerDay: dateSheet.constraints?.maxExamsPerFacultyPerDay || 1,
            minGapBetweenSameFacultyExams: dateSheet.constraints?.minGapBetweenSameFacultyExams || 24,
            minGapBetweenSameStudentExams: dateSheet.constraints?.minGapBetweenSameStudentExams || 24
        }
    })

    const onSubmit = async (values: z.infer<typeof constraintsSchema>) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/datesheets/${dateSheet._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    constraints: values
                })
            })

            if (!response.ok) {
                throw new Error("Failed to update constraints")
            }

            toast({
                title: "Success",
                description: "Scheduling constraints updated successfully"
            })
        } catch (error) {
            console.error("Error updating constraints:", error)
            toast({
                title: "Error",
                description: "Failed to update constraints. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="minGapBetweenExams"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Gap Between Exams (hours)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min={0} max={24} />
                                </FormControl>
                                <FormDescription>Minimum hours between any two exams</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="maxExamsPerDay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Maximum Exams Per Day</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min={1} max={4} />
                                </FormControl>
                                <FormDescription>Maximum number of exams that can be scheduled on any day</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="maxExamsPerStudentPerDay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Maximum Exams Per Student Per Day</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min={1} max={2} />
                                </FormControl>
                                <FormDescription>Maximum number of exams a student can have in one day</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="maxExamsPerFacultyPerDay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Maximum Exams Per Faculty Per Day</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min={1} max={2} />
                                </FormControl>
                                <FormDescription>Maximum number of exams a faculty member can have in one day</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="minGapBetweenSameFacultyExams"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Gap Between Same Faculty Exams (hours)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min={1} max={72} />
                                </FormControl>
                                <FormDescription>Minimum hours between exams for the same faculty member</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="minGapBetweenSameStudentExams"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum Gap Between Same Student Exams (hours)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} min={1} max={72} />
                                </FormControl>
                                <FormDescription>Minimum hours between exams for the same student</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Preferred Days</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">
                        {daysOfWeek.map((day) => (
                            <FormField
                                key={day}
                                control={form.control}
                                name="preferredDays"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(day)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        field.onChange([...field.value, day])
                                                    } else {
                                                        field.onChange(field.value?.filter((d) => d !== day))
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
                        name="blackoutDates"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Dates to Exclude</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn("w-full pl-3 text-left font-normal", !field.value?.length && "text-muted-foreground")}
                                            >
                                                {field.value?.length
                                                    ? `${field.value.length} date${field.value.length === 1 ? "" : "s"} selected`
                                                    : "Select dates to exclude"}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="multiple"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => {
                                                // Can only select dates within the date sheet range
                                                const startDate = new Date(dateSheet.startDate)
                                                const endDate = new Date(dateSheet.endDate)
                                                return date < startDate || date > endDate
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormDescription>
                                    Select dates that should be excluded from the exam schedule (e.g., holidays)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Constraints"
                    )}
                </Button>
            </form>
        </Form>
    )
}