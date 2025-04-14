import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Loader2 } from "lucide-react"

interface Conflict {
    type: string
    description: string
    exams: any[]
}

interface ScheduleManagerProps {
    dateSheetId: string
}

export function ScheduleManager({ dateSheetId }: ScheduleManagerProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [conflicts, setConflicts] = useState<Conflict[]>([])
    const [scheduleResult, setScheduleResult] = useState<{
        success: boolean
        scheduledExams: any[]
        conflicts: Conflict[]
    } | null>(null)

    const detectConflicts = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/schedule?dateSheetId=${dateSheetId}`)
            const data = await response.json()
            setConflicts(data.conflicts)
        } catch (error) {
            console.error("Error detecting conflicts:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const scheduleExams = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/schedule", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ dateSheetId }),
            })
            const data = await response.json()
            setScheduleResult(data)
        } catch (error) {
            console.error("Error scheduling exams:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Schedule Management</CardTitle>
                    <CardDescription>
                        Manage exam schedules and detect conflicts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Button
                            onClick={detectConflicts}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Detecting Conflicts...
                                </>
                            ) : (
                                "Detect Conflicts"
                            )}
                        </Button>
                        <Button
                            onClick={scheduleExams}
                            disabled={isLoading}
                            variant="secondary"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Scheduling Exams...
                                </>
                            ) : (
                                "Schedule Exams"
                            )}
                        </Button>
                    </div>

                    {conflicts.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Detected Conflicts</h3>
                            {conflicts.map((conflict, index) => (
                                <Alert key={index} variant="destructive">
                                    <AlertTitle>{conflict.type} Conflict</AlertTitle>
                                    <AlertDescription>
                                        {conflict.description}
                                        <div className="mt-2">
                                            <strong>Affected Exams:</strong>
                                            <ul className="list-disc list-inside">
                                                {conflict.exams.map((exam, examIndex) => (
                                                    <li key={examIndex}>
                                                        {exam.courseId} - {exam.date} {exam.startTime}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </div>
                    )}

                    {scheduleResult && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Scheduling Result</h3>
                            {scheduleResult.success ? (
                                <Alert>
                                    <AlertTitle>Success</AlertTitle>
                                    <AlertDescription>
                                        All exams have been successfully scheduled.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert variant="destructive">
                                    <AlertTitle>Failed</AlertTitle>
                                    <AlertDescription>
                                        Some exams could not be scheduled due to conflicts.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 