"use server"

import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import ClashReport from "@/models/ClashReport"
import Exam from "@/models/Exam"

const clashReportSchema = z.object({
  examIds: z.array(z.string()).min(2, "Please select at least two exams"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
})

export async function createClashReport(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "student") {
      return { error: "Unauthorized" }
    }

    const examIds = formData.getAll("examIds").map((id) => id.toString())

    const validatedFields = clashReportSchema.parse({
      examIds,
      description: formData.get("description"),
    })

    await dbConnect()

    // Validate that the exams exist
    for (const examId of validatedFields.examIds) {
      const exam = await Exam.findById(examId)
      if (!exam) {
        return { error: `Exam with ID ${examId} not found` }
      }
    }

    await ClashReport.create({
      studentId: session.user.id,
      examIds: validatedFields.examIds,
      description: validatedFields.description,
      status: "pending",
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to create clash report. Please try again." }
  }
}

export async function resolveClashReport(id: string, resolution: "resolved" | "rejected") {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return { error: "Unauthorized" }
    }

    await dbConnect()

    const clashReport = await ClashReport.findByIdAndUpdate(
      id,
      {
        status: resolution,
        resolvedAt: new Date(),
      },
      { new: true },
    )

    if (!clashReport) {
      return { error: "Clash report not found" }
    }

    return { success: true }
  } catch (error) {
    return { error: "Failed to resolve clash report. Please try again." }
  }
}
