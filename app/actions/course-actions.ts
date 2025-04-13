"use server"

import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Course from "@/models/Course"

const courseSchema = z.object({
    code: z.string().min(2, "Course code must be at least 2 characters"),
    name: z.string().min(3, "Course name must be at least 3 characters"),
    departmentId: z.string(),
    facultyId: z.string(),
    semester: z.coerce.number().int().min(1).max(8),
    creditHours: z.coerce.number().min(1).max(6),
})

export async function createCourse(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "admin") {
            return { error: "Unauthorized" }
        }

        const validatedFields = courseSchema.parse({
            code: formData.get("code"),
            name: formData.get("name"),
            departmentId: formData.get("departmentId"),
            facultyId: formData.get("facultyId"),
            semester: formData.get("semester"),
            creditHours: formData.get("creditHours"),
        })

        await dbConnect()

        // Check if course code already exists
        const existingCourse = await Course.findOne({ code: validatedFields.code })
        if (existingCourse) {
            return { error: "A course with this code already exists" }
        }

        // Create new course
        const course = await Course.create(validatedFields)

        return { success: true, course }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message }
        }
        return { error: "Failed to create course. Please try again." }
    }
}

export async function updateCourse(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "admin") {
            return { error: "Unauthorized" }
        }

        const id = formData.get("id") as string
        if (!id) {
            return { error: "Course ID is required" }
        }

        const validatedFields = courseSchema.parse({
            code: formData.get("code"),
            name: formData.get("name"),
            departmentId: formData.get("departmentId"),
            facultyId: formData.get("facultyId"),
            semester: formData.get("semester"),
            creditHours: formData.get("creditHours"),
        })

        await dbConnect()

        // Check if course code already exists (excluding this course)
        const existingCourse = await Course.findOne({ code: validatedFields.code, _id: { $ne: id } })
        if (existingCourse) {
            return { error: "A course with this code already exists" }
        }

        // Update course
        const course = await Course.findByIdAndUpdate(id, validatedFields, { new: true })

        if (!course) {
            return { error: "Course not found" }
        }

        return { success: true, course }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message }
        }
        return { error: "Failed to update course. Please try again." }
    }
}
