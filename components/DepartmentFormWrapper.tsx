"use client"

import { DepartmentForm } from "./DepartmentForm"
import { createDepartment } from "@/app/actions/departments"
import { useRouter } from "next/navigation"

export function DepartmentFormWrapper() {
    const router = useRouter()

    const handleSubmit = async (data: { name: string; code: string }) => {
        await createDepartment(data)
        router.refresh()
    }

    return <DepartmentForm onSubmit={handleSubmit} />
} 