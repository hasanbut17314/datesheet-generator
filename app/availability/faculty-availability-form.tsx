"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const availabilitySchema = z.object({
    unavailableDates: z.array(z.date()),
    preferredTimeSlots: z.array(z.object({
        day: z.string(),
        startTime: z.string(),
        endTime: z.string()
    })).optional(),
    maxExamsPerDay: z.coerce.number().min(1).max(3),
    maxExamsPerWeek: z.coerce.number().min(1).max(10),
    preferredVenues: z.array(z.string()).optional(),
    notes: z.string().max(500).optional()
})

interface FacultyAvailabilityFormProps {
    facultyId: string
    dateSheetId: string
    startDate: Date
    endDate: Date
}

export function FacultyAvailabilityForm({ facultyId, dateSheetId, startDate, endDate }: FacultyAvailabilityFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [timeSlots, setTimeSlots] = useState<{ day: string, startTime: string, endTime: string }[]>([])
    const { toast } = useToast()

    const form = useForm<z.infer<typeof availabilitySchema>>({
        resolver: zodResolver(availabilitySchema),
        defaultValues: {
            unavailableDates: [],
            preferredTimeSlots: [],
            maxExamsPerDay: 2,
            maxExamsPerWeek: 6,
            preferredVenues: [],
            notes: ""
        }
    })

    // Fetch existing availability data
    useEffect(() => {
        async function fetchAvailability() {
            try {
                setIsFetching(true)
                const response = await fetch(`/api/faculty-availability?facultyId=${facultyId}&dateSheetId=${dateSheetId}`)

                if (response.ok) {
                    const data = await response.json()
                    if (data) {
                        // Update form values with existing data
                        form.reset({
                            unavailableDates: data.unavailableDates?.map((date: any) => new Date(date)) || [],
                            preferredTimeSlots: data.preferredTimeSlots || [],
                            maxExamsPerDay: data.maxExamsPerDay || 2,
                            maxExamsPerWeek: data.maxExamsPerWeek || 6,
                            preferredVenues: data.preferredVenues || [],
                            notes: data.notes || ""
                        })
                        setTimeSlots(data.preferredTimeSlots || [])
                    }
                }
            } catch (error) {
                console.error("Error fetching availability:", error)
            } finally {
                setIsFetching(false)
            }
        }

        fetchAvailability()
    }, [facultyId, dateSheetId, form])

    const onSubmit = async (values: z.infer<typeof availabilitySchema>) => {
        setIsLoading(true)
        try {
            // Update preferred time slots with the current state
            const formData = {
                ...values,
                preferredTimeSlots: timeSlots,
                facultyId,
                dateSheetId
            }

            const response = await fetch("/api/faculty-availability", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                throw new Error("Failed to save availability")
            }

            toast({
                title: "Success",
                description: "Your availability has been saved successfully"
            })
        } catch (error) {
            console.error("Error saving availability:", error)
            toast({
                title: "Error",
                description: "Failed to save availability. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const addTimeSlot = () => {
        setTimeSlots([...timeSlots, { day: "Monday", startTime: "09:00", endTime: "12:00" }])
    }

    const updateTimeSlot = (index: number, field: string, value: string) => {
        const updatedSlots = [...timeSlots]
        updatedSlots[index] = { ...updatedSlots[index], [field]: value }
        setTimeSlots(updatedSlots)
    }

    const removeTimeSlot = (index: number) => {
        setTimeSlots(timeSlots.filter((_, i) => i !== index))
    }

    if (isFetching) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2">Loading availability data...</span>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="unavailable">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="unavailable">Unavailable Dates</TabsTrigger>
                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    </TabsList>

                    <TabsContent value="unavailable" className="pt-4">
                        <FormField
                            control={form.control}
                            name="unavailableDates"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Unavailable Dates</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn("w-full pl-3 text-left font-normal", !field.value?.length && "text-muted-foreground")}
                                                >
                                                    {field.value?.length
                                                        ? `${field.value.length} date${field.value.length === 1 ? "" : "s"} selected`
                                                        : "Select dates you're unavailable"}
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
                                                    return date < startDate || date > endDate
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        Select dates when you are not available for exam supervision.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>

                    <TabsContent value="preferences" className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Preferred Time Slots</h3>
                                <Button type="button" variant="outline" onClick={addTimeSlot} size="sm">
                                    Add Time Slot
                                </Button>
                            </div>

                            {timeSlots.length === 0 ? (
                                <div className="rounded-md border border-dashed p-6 text-center">
                                    <p className="text-sm text-muted-foreground">No preferred time slots added yet.</p>
                                    <Button type="button" variant="outline" onClick={addTimeSlot} className="mt-2">
                                        Add Time Slot
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {timeSlots.map((slot, index) => (
                                        <div key={index} className="flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-end">
                                            <div className="grid flex-1 gap-2">
                                                <label className="text-sm font-medium">Day</label>
                                                <select
                                                    value={slot.day}
                                                    onChange={(e) => updateTimeSlot(index, "day", e.target.value)}
                                                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                >
                                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                                                        <option key={day} value={day}>{day}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid flex-1 gap-2">
                                                <label className="text-sm font-medium">Start Time</label>
                                                <Input
                                                    type="time"
                                                    value={slot.startTime}
                                                    onChange={(e) => updateTimeSlot(index, "startTime", e.target.value)}
                                                />
                                            </div>
                                            <div className="grid flex-1 gap-2">
                                                <label className="text-sm font-medium">End Time</label>
                                                <Input
                                                    type="time"
                                                    value={slot.endTime}
                                                    onChange={(e) => updateTimeSlot(index, "endTime", e.target.value)}
                                                />
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeTimeSlot(index)} className="h-10 w-10 shrink-0">
                                                ×
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="maxExamsPerDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Exams Per Day</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} min={1} max={3} />
                                        </FormControl>
                                        <FormDescription>
                                            Maximum number of exams you can supervise in a single day
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="maxExamsPerWeek"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Exams Per Week</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} min={1} max={10} />
                                        </FormControl>
                                        <FormDescription>
                                            Maximum number of exams you can supervise in a week
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any additional information about your availability..."
                                            {...field}
                                            className="min-h-24"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Provide any additional information that might help with exam scheduling
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                </Tabs>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Availability"
                    )}
                </Button>
            </form>
        </Form>
    )
}