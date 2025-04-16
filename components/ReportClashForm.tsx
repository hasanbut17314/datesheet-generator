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
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const clashReportSchema = z.object({
    examIds: z.array(z.string()).min(2, "Please select at least two exams"),
    description: z.string().min(10, "Please provide more details").max(500, "Description is too long"),
    type: z.enum(["time", "venue", "faculty", "resource", "other"], {
        required_error: "Please select a clash type",
    }),
    priority: z.enum(["low", "medium", "high", "critical"], {
        required_error: "Please select a priority level",
    }),
    impact: z.string().min(10, "Please describe the impact").max(200, "Impact description is too long"),
    affectedStudents: z.coerce.number().min(1, "Must affect at least one student"),
    suggestedResolution: z.string().max(500, "Suggested resolution is too long").optional(),
})

export function ReportClashForm() {
    const [open, setOpen] = useState(false)
    const [exams, setExams] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof clashReportSchema>>({
        resolver: zodResolver(clashReportSchema),
        defaultValues: {
            examIds: [],
            description: "",
            type: "time",
            priority: "medium",
            impact: "",
            affectedStudents: 1,
        },
    })

    // Fetch student's exams when dialog opens
    useEffect(() => {
        if (open) {
            fetchExams()
        }
    }, [open])

    async function fetchExams() {
        try {
            setIsFetching(true)
            const response = await fetch("/api/user/exams")

            if (!response.ok) {
                throw new Error("Failed to fetch exams")
            }

            const data = await response.json()
            setExams(data)
        } catch (error) {
            console.error("Error fetching exams:", error)
            toast({
                title: "Error",
                description: "Failed to load your exams. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsFetching(false)
        }
    }

    async function onSubmit(values: z.infer<typeof clashReportSchema>) {
        try {
            setIsLoading(true)

            const response = await fetch("/api/clash-reports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                throw new Error("Failed to submit clash report")
            }

            toast({
                title: "Success",
                description: "Your clash report has been submitted successfully.",
            })

            form.reset()
            setOpen(false)
        } catch (error) {
            console.error("Error submitting clash report:", error)
            toast({
                title: "Error",
                description: "Failed to submit clash report. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Report Exam Clash</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Report Exam Clash</DialogTitle>
                    <DialogDescription>
                        Submit a report for conflicting exams in your schedule.
                    </DialogDescription>
                </DialogHeader>

                {isFetching ? (
                    <div className="flex items-center justify-center p-6">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2">Loading your exams...</span>
                    </div>
                ) : exams.length < 2 ? (
                    <div className="p-6 text-center">
                        <p className="text-muted-foreground">
                            You need at least two exams in your schedule to report a clash.
                        </p>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
                            <FormField
                                control={form.control}
                                name="examIds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Conflicting Exams</FormLabel>
                                        <div className="max-h-[150px] overflow-y-auto rounded-md border p-2">
                                            {exams.map((exam) => (
                                                <div key={exam._id} className="flex items-center space-x-2 py-1">
                                                    <input
                                                        type="checkbox"
                                                        id={exam._id}
                                                        checked={field.value.includes(exam._id)}
                                                        onChange={(e) => {
                                                            const value = [...field.value]
                                                            if (e.target.checked) {
                                                                value.push(exam._id)
                                                            } else {
                                                                const index = value.indexOf(exam._id)
                                                                if (index !== -1) {
                                                                    value.splice(index, 1)
                                                                }
                                                            }
                                                            field.onChange(value)
                                                        }}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    <label htmlFor={exam._id} className="text-sm">
                                                        {exam.courseId.code} - {exam.courseId.name} ({new Date(exam.date).toLocaleDateString()}, {exam.startTime})
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        <FormDescription>
                                            Select the exams that have a conflict
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Clash Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select clash type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="time">Time Conflict</SelectItem>
                                                <SelectItem value="venue">Venue Conflict</SelectItem>
                                                <SelectItem value="faculty">Faculty Conflict</SelectItem>
                                                <SelectItem value="resource">Resource Conflict</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select the type of clash you're experiencing
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex space-x-2"
                                            >
                                                <FormItem className="flex items-center space-x-1 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="low" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Low</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-1 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="medium" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Medium</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-1 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="high" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">High</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-1 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="critical" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Critical</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormDescription>
                                            How urgent is this clash?
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="affectedStudents"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Affected Students</FormLabel>
                                            <FormControl>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    {...field}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                How many students are affected?
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Please describe the clash in detail..."
                                                {...field}
                                                className="min-h-20"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide details about the clash to help resolve it
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="impact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Impact</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="How does this clash affect you and other students?"
                                                {...field}
                                                className="min-h-20"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Describe how this clash affects your studies
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="suggestedResolution"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Suggested Resolution (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Do you have any suggestions to resolve this clash?"
                                                {...field}
                                                className="min-h-20"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide any suggestions that might help resolve the clash
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Report"
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