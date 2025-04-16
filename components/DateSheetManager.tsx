"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DateSheetManagerProps {
    dateSheetId: string
}

export function DateSheetManager({ dateSheetId }: DateSheetManagerProps) {
    const [isDetectingConflicts, setIsDetectingConflicts] = useState(false)
    const [isScheduling, setIsScheduling] = useState(false)
    const [conflicts, setConflicts] = useState<Array<{
        type: string
        description: string
        exams: any[]
    }>>([])
    const { toast } = useToast()

    // Function to detect conflicts in the schedule
    const detectConflicts = async () => {
        setIsDetectingConflicts(true)
        try {
            const response = await fetch(`/api/scheduler?dateSheetId=${dateSheetId}`)

            if (!response.ok) {
                throw new Error("Failed to detect conflicts")
            }

            const data = await response.json()
            setConflicts(data.conflicts || [])

            if (data.conflicts?.length === 0) {
                toast({
                    title: "Success",
                    description: "No conflicts detected in the schedule."
                })
            }
        } catch (error) {
            console.error("Error detecting conflicts:", error)
            toast({
                title: "Error",
                description: "Failed to detect conflicts. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsDetectingConflicts(false)
        }
    }

    // Function to automatically schedule exams
    const autoScheduleExams = async () => {
        setIsScheduling(true)
        try {
            const response = await fetch("/api/scheduler", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ dateSheetId })
            })

            if (!response.ok) {
                throw new Error("Failed to schedule exams")
            }

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Success",
                    description: `Successfully scheduled ${data.scheduledExams?.length || 0} exams.`
                })
            } else {
                setConflicts(data.conflicts || [])
                toast({
                    title: "Warning",
                    description: "Schedule generated with some conflicts. Please review.",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Error scheduling exams:", error)
            toast({
                title: "Error",
                description: "Failed to schedule exams. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsScheduling(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Schedule Management</CardTitle>
                <CardDescription>
                    Manage exam scheduling and detect conflicts
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    <div className="flex gap-4">
                        <Button
                            onClick={detectConflicts}
                            disabled={isDetectingConflicts || isScheduling}
                        >
                            {isDetectingConflicts ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Detecting Conflicts...
                                </>
                            ) : (
                                "Detect Conflicts"
                            )}
                        </Button>
                        <Button
                            onClick={autoScheduleExams}
                            disabled={isDetectingConflicts || isScheduling}
                            variant="secondary"
                        >
                            {isScheduling ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Scheduling Exams...
                                </>
                            ) : (
                                "Auto Schedule Exams"
                            )}
                        </Button>
                    </div>

                    {conflicts.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Detected Conflicts</h3>
                            {conflicts.map((conflict, index) => (
                                <Alert key={index} variant="destructive">
                                    <AlertTitle>{conflict.type.toUpperCase()} Conflict</AlertTitle>
                                    <AlertDescription>
                                        {conflict.description}
                                        <div className="mt-2">
                                            <strong>Affected Exams:</strong>
                                            <ul className="list-disc list-inside">
                                                {conflict.exams.map((exam, examIndex) => (
                                                    <li key={examIndex}>
                                                        {exam.courseId?.code || exam.courseId} - {new Date(exam.date).toLocaleDateString()} {exam.startTime}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}