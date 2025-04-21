"use client"

import { Batch } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { deleteBatch } from "@/app/actions/batches"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

interface BatchesListProps {
    batches: Batch[]
}

export function BatchesList({ batches }: BatchesListProps) {
    const router = useRouter()

    const handleDelete = async (id: string) => {
        await deleteBatch(id)
        router.refresh()
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Batches List</CardTitle>
            </CardHeader>
            <CardContent>
                {batches.length === 0 ? (
                    <p className="text-muted-foreground">No batches found.</p>
                ) : (
                    <ul className="space-y-4">
                        {batches.map((batch) => (
                            <li key={batch._id} className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <p className="font-medium">{batch.sessionYear}</p>
                                    <p className="text-sm text-muted-foreground">{batch.departmentName}</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => handleDelete(batch._id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}