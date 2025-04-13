"use server"

import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["student", "faculty", "admin"]),
    departmentId: z.string().optional(),
})

const updateUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    role: z.enum(["student", "faculty", "admin"]),
    departmentId: z.string().optional(),
})

export async function createUser(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "admin") {
            return { error: "Unauthorized" }
        }

        const validatedFields = createUserSchema.parse({
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
        const user = await User.create(validatedFields)

        return { success: true, user: { id: user._id.toString(), ...validatedFields, password: undefined } }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message }
        }
        return { error: "Failed to create user. Please try again." }
    }
}

export async function updateUser(formData: FormData) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "admin") {
            return { error: "Unauthorized" }
        }

        const id = formData.get("id") as string
        if (!id) {
            return { error: "User ID is required" }
        }

        // Create an object with only the fields that are present
        const updateData: any = {}
        updateData.name = formData.get("name")
        updateData.email = formData.get("email")
        updateData.role = formData.get("role")

        const password = formData.get("password")
        if (password && typeof password === "string" && password.length > 0) {
            updateData.password = password
        }

        const departmentId = formData.get("departmentId")
        if (departmentId && typeof departmentId === "string" && departmentId.length > 0) {
            updateData.departmentId = departmentId
        } else if (updateData.role === "admin") {
            // Remove departmentId for admin users
            updateData.departmentId = null
        }

        // Validate the fields
        const validatedFields = updateUserSchema.partial().parse(updateData)

        await dbConnect()

        // Check if email already exists (excluding this user)
        if (validatedFields.email) {
            const existingUser = await User.findOne({ email: validatedFields.email, _id: { $ne: id } })
            if (existingUser) {
                return { error: "User with this email already exists" }
            }
        }

        // Update user
        const user = await User.findByIdAndUpdate(id, validatedFields, { new: true })

        if (!user) {
            return { error: "User not found" }
        }

        return { success: true, user }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message }
        }
        return { error: "Failed to update user. Please try again." }
    }
}
