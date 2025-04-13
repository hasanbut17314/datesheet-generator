import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user.role !== "admin" && session.user.role !== "faculty")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()

        const searchParams = req.nextUrl.searchParams
        const role = searchParams.get("role")
        const departmentId = searchParams.get("departmentId")

        const query: any = {}

        if (role) query.role = role
        if (departmentId) query.departmentId = departmentId

        const users = await User.find(query).select("-password")

        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()
        const data = await req.json()

        // Hash password is handled in the User model pre-save hook

        const user = await User.create(data)

        // Don't return the password
        const userWithoutPassword = { ...user.toObject(), password: undefined }

        return NextResponse.json(userWithoutPassword, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 })
    }
}
