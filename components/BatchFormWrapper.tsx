"use client"

import { BatchForm } from "@/components/BatchForm"

import { createBatch } from "@/app/actions/batches"
import { useRouter } from "next/navigation"
import { Department } from "@/lib/types"

interface BatchFormWrapperProps {
    departments: Department[]
}

export function BatchFormWrapper({ departments }: BatchFormWrapperProps) {
    const router = useRouter()

    const handleSubmit = async (data: { sessionYear: string; departmentId: string }) => {
        await createBatch(data)
        router.refresh()
    }

    return <BatchForm departments={departments} onSubmit={handleSubmit} />
}