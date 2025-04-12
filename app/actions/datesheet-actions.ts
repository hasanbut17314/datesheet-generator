"use server"

import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import DateSheet from "@/models/DateSheet"

const dateSheetSchema = z.object({
  name: z.string().min(5, "Name must be at least 5 characters"),
  departmentId: z.string(),
  semester: z.coerce.number().int().min(1).max(8),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
})

export async function createDateSheet(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const validatedFields = dateSheetSchema.parse({
      name: formData.get("name"),
      departmentId: formData.get("department"),
      semester: formData.get("semester"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
    })

    await dbConnect()

    // Validate that end date is after start date
    if (validatedFields.endDate < validatedFields.startDate) {
      return { error: "End date must be after start date" }
    }

    await DateSheet.create({
      ...validatedFields,
      status: "draft",
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to create datesheet. Please try again." }
  }
}

export async function publishDateSheet(id: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return { error: "Unauthorized" }
    }

    await dbConnect()

    const datesheet = await DateSheet.findByIdAndUpdate(id, { status: "published" }, { new: true })

    if (!datesheet) {
      return { error: "Datesheet not found" }
    }

    return { success: true }
  } catch (error) {
    return { error: "Failed to publish datesheet. Please try again." }
  }
}
