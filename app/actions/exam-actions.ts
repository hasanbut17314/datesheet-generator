"use server"

import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Course from "@/models/Course"
import DateSheet from "@/models/DateSheet"

const examSchema = z.object({
  courseId: z.string(),
  dateSheetId: z.string(),
  date: z.coerce.date(),
  startTime: z.string(),
  endTime: z.string(),
  venue: z.string(),
  type: z.enum(["midterm", "final", "quiz", "other"]),
})

export async function createExam(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return { error: "Unauthorized" }
    }

    const validatedFields = examSchema.parse({
      courseId: formData.get("course"),
      dateSheetId: formData.get("dateSheetId"),
      date: formData.get("date"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      venue: formData.get("venue"),
      type: formData.get("type"),
    })

    await dbConnect()

    // Validate that the course exists
    const course = await Course.findById(validatedFields.courseId)
    if (!course) {
      return { error: "Course not found" }
    }

    // Validate that the datesheet exists
    const datesheet = await DateSheet.findById(validatedFields.dateSheetId)
    if (!datesheet) {
      return { error: "Datesheet not found" }
    }

    // Validate that the date is within the datesheet range
    if (validatedFields.date < datesheet.startDate || validatedFields.date > datesheet.endDate) {
      return { error: "Exam date must be within the datesheet date range" }
    }

    // Validate that end time is after start time
    if (validatedFields.endTime <= validatedFields.startTime) {
      return { error: "End time must be after start time" }
    }

    // Check for clashes
    const existingExams = await Exam.find({
      dateSheetId: validatedFields.dateSheetId,
      date: validatedFields.date,
      $or: [
        {
          startTime: { $lte: validatedFields.endTime },
          endTime: { $gte: validatedFields.startTime },
        },
        {
          venue: validatedFields.venue,
          startTime: { $lte: validatedFields.endTime },
          endTime: { $gte: validatedFields.startTime },
        },
      ],
    })

    if (existingExams.length > 0) {
      return {
        error: "Exam clash detected. There is already an exam scheduled at this time or venue.",
        clashes: existingExams,
      }
    }

    await Exam.create({
      ...validatedFields,
      status: "scheduled",
    })

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to create exam. Please try again." }
  }
}
