"use server"
import dbConnect from "@/lib/mongodb"
import { Department as DepartmentType } from "@/lib/types"

import connectToDatabase from "@/lib/mongodb"
import Department from "@/models/Department"

export async function createDepartment(data: { name: string; code: string }) {
    await connectToDatabase()
    const department = await Department.create(data)
    return department
}

export async function deleteDepartment(id: string) {
    await connectToDatabase()
    await Department.findByIdAndDelete(id)
}

export async function getDepartments(): Promise<DepartmentType[]> {
    await dbConnect()
    const departments = await Department.find().sort({ name: 1 })
    return departments.map(doc => ({
        _id: doc._id.toString(),
        name: doc.name,
        code: doc.code,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
    }))
}