"use server"

import connectToDatabase from "@/lib/mongodb"
import Batch from "@/models/Batch"
import Department from "@/models/Department"
import { Batch as BatchType } from "@/lib/types"

export async function createBatch(data: { sessionYear: string; departmentId: string }) {
    await connectToDatabase()
    const batch = await Batch.create(data)
    const department = await Department.findById(data.departmentId)
    return {
        _id: batch._id.toString(),
        sessionYear: batch.sessionYear,
        departmentId: batch.departmentId.toString(),
        departmentName: department ? department.name : "",
        createdAt: batch.createdAt.toISOString(),
        updatedAt: batch.updatedAt.toISOString()
    }
}

export async function deleteBatch(id: string) {
    await connectToDatabase()
    await Batch.findByIdAndDelete(id)
}

export async function getBatches(): Promise<BatchType[]> {
    await connectToDatabase()
    const batches = await Batch.find().populate("departmentId").sort({ sessionYear: 1 })
    return batches.map(doc => ({
        _id: doc._id.toString(),
        sessionYear: doc.sessionYear,
        departmentId: doc.departmentId._id.toString(),
        departmentName: doc.departmentId.name,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
    }))
}