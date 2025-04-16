// components/ClashReportsList.tsx

"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

interface ClashReportsListProps {
    dateSheetId?: string
}

export function ClashReportsList({ dateSheetId }: ClashReportsListProps) {
    const [clashReports, setClashReports] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        async function fetchClashReports() {
            try {
                setIsLoading(true)
                const url = dateSheetId
                    ? `/api/clash-reports?status=pending&dateSheetId=${dateSheetId}`
                    : `/api/clash-reports?status=pending`

                const response = await fetch(url)

                if (!response.ok) {
                    throw new Error("Failed to fetch clash reports")
                }

                const data = await response.json()
                setClashReports(data)
            } catch (error) {
                console.error("Error fetching clash reports:", error)
                toast({
                    title: "Error",
                    description: "Failed to load clash reports. Please try again.",
                    variant: "destructive"
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchClashReports()
    }, [dateSheetId, toast])

    async function resolveClashReport(id: string, resolution: 'resolved' | 'rejected') {
        try {
            const response = await fetch(`/api/clash-reports/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: resolution })
            })

            if (!response.ok) {
                throw new Error("Failed to update clash report")
            }

            // Update the list by removing the resolved/rejected report
            setClashReports(prevReports => prevReports.filter(report => report._id !== id))

            toast({
                title: "Success",
                description: `Clash report ${resolution}`,
            })
        } catch (error) {
            console.error(`Error ${resolution} clash report:`, error)
            toast({
                title: "Error",
                description: `Failed to ${resolution} clash report. Please try again.`,
                variant: "destructive"
            })
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2">Loading clash reports...</span>
            </div>
        )
    }

    if (clashReports.length === 0) {
        return (
            <div className="rounded-md border border-dashed p-8 text-center">
                <h3 className="text-lg font-medium">No Pending Clash Reports</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    There are no pending clash reports at this time.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {clashReports.map((report) => (
                <Card key={report._id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                    {report.studentId.name?.charAt(0).toUpperCase() || "S"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{report.studentId.name}</CardTitle>
                                <CardDescription>{report.studentId.email}</CardDescription>
                            </div>
                        </div>
                        <Badge
                            variant={
                                report.priority === "high" || report.priority === "critical"
                                    ? "destructive"
                                    : report.priority === "medium"
                                        ? "default"
                                        : "outline"
                            }
                        >
                            {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium">Description</h4>
                                <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Affected Exams</h4>
                                <ul className="mt-2 space-y-2">
                                    {report.examIds.map((exam: any) => (
                                        <li key={exam._id} className="rounded-md border p-2 text-sm">
                                            <div className="font-medium">{exam.courseId.code} - {exam.courseId.name}</div>
                                            <div className="mt-1 text-xs text-muted-foreground">
                                                Date: {new Date(exam.date).toLocaleDateString()} | Time: {exam.startTime} - {exam.endTime} | Venue: {exam.venue}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {report.suggestedResolution && (
                                <div>
                                    <h4 className="font-medium">Suggested Resolution</h4>
                                    <p className="mt-1 text-sm text-muted-foreground">{report.suggestedResolution}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium">Affected Students</h4>
                                    <p className="mt-1 text-sm text-muted-foreground">{report.affectedStudents}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium">Type</h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Conflict
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2">
                        <Button variant="outline" onClick={() => resolveClashReport(report._id, "rejected")}>
                            Reject
                        </Button>
                        <Button onClick={() => resolveClashReport(report._id, "resolved")}>
                            Resolve
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}