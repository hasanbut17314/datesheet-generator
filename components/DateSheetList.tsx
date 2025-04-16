"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { DateSheet } from "@/lib/types"
import { deleteDateSheet } from "@/app/actions/datesheets"
import { useRouter } from "next/navigation"

interface DateSheetListProps {
    dateSheets?: DateSheet[]
}

export function DateSheetList({ dateSheets = [] }: DateSheetListProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async (id: string) => {
        setIsLoading(true)
        try {
            await deleteDateSheet(id)
            router.refresh()
        } catch (error) {
            console.error("Failed to delete date sheet:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Date Sheets</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dateSheets.map((dateSheet) => (
                            <TableRow key={dateSheet.id}>
                                <TableCell>{dateSheet.name}</TableCell>
                                <TableCell>
                                    {typeof dateSheet.departmentId === 'object' && dateSheet.departmentId !== null
                                        ? dateSheet.departmentId.name
                                        : dateSheet.departmentId}
                                </TableCell>
                                <TableCell>{dateSheet.semester}</TableCell>
                                <TableCell>{new Date(dateSheet.startDate).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(dateSheet.endDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${dateSheet.status === "published" ? "bg-green-100 text-green-800" :
                                        dateSheet.status === "draft" ? "bg-yellow-100 text-yellow-800" :
                                            "bg-gray-100 text-gray-800"
                                        }`}>
                                        {dateSheet.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => router.push(`/datesheets/${dateSheet.id}`)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(dateSheet.id)}
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
} 