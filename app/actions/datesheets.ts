"use server"

import connectToDatabase from "@/lib/mongodb"
import { DateSheet } from "@/lib/types"
import DateSheetModel from "@/models/DateSheet"

export async function createDateSheet(data: Omit<DateSheet, "id">) {
    await connectToDatabase()
    const dateSheet = await DateSheetModel.create(data)
    return {
        id: dateSheet._id.toString(),
        name: dateSheet.name,
        departmentId: dateSheet.departmentId,
        semester: dateSheet.semester,
        startDate: dateSheet.startDate.toISOString(),
        endDate: dateSheet.endDate.toISOString(),
        status: dateSheet.status,
        exams: dateSheet.exams
    }
}

export async function updateDateSheet(id: string, data: Partial<DateSheet>) {
    await connectToDatabase()
    const dateSheet = await DateSheetModel.findByIdAndUpdate(id, data, { new: true })
    return {
        id: dateSheet._id.toString(),
        name: dateSheet.name,
        departmentId: dateSheet.departmentId,
        semester: dateSheet.semester,
        startDate: dateSheet.startDate.toISOString(),
        endDate: dateSheet.endDate.toISOString(),
        status: dateSheet.status,
        exams: dateSheet.exams
    }
}

export async function deleteDateSheet(id: string) {
    await connectToDatabase()
    await DateSheetModel.findByIdAndDelete(id)
}

export async function getDateSheets(): Promise<DateSheet[]> {
    await connectToDatabase()
    const dateSheets = await DateSheetModel.find().sort({ createdAt: -1 })
    return dateSheets.map(doc => ({
        id: doc._id.toString(),
        name: doc.name,
        departmentId: doc.departmentId,
        semester: doc.semester,
        startDate: doc.startDate.toISOString(),
        endDate: doc.endDate.toISOString(),
        status: doc.status,
        exams: doc.exams
    }))
}

export async function getDateSheet(id: string): Promise<DateSheet | null> {
    await connectToDatabase()
    const dateSheet = await DateSheetModel.findById(id)
    if (!dateSheet) return null
    return {
        id: dateSheet._id.toString(),
        name: dateSheet.name,
        departmentId: dateSheet.departmentId,
        semester: dateSheet.semester,
        startDate: dateSheet.startDate.toISOString(),
        endDate: dateSheet.endDate.toISOString(),
        status: dateSheet.status,
        exams: dateSheet.exams
    }
} 