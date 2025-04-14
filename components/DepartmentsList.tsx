"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { Department } from "@/lib/types"
import { deleteDepartment } from "@/app/actions/departments"
import { useRouter } from "next/navigation"

interface DepartmentsListProps {
    departments: Department[]
}

export function DepartmentsList({ departments }: DepartmentsListProps) {
    const router = useRouter()

    const handleDelete = async (id: string) => {
        await deleteDepartment(id)
        router.refresh()
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Department List</CardTitle>
                <CardDescription>
                    View and manage all departments
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {departments.map((department) => (
                            <TableRow key={department._id}>
                                <TableCell>{department.name}</TableCell>
                                <TableCell>{department.code}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(department._id)}
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