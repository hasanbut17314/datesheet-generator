"use server"

import { z } from "zod"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "faculty", "admin"]),
  departmentId: z.unknown().optional(),
})

export async function registerUser(formData: FormData) {
  try {
    const validatedFields = registerSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      departmentId: formData.get("departmentId"),
    })

    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedFields.email })
    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Create new user
    await User.create(validatedFields)

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Registration failed. Please try again." }
  }
}
