import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()

        const users = await User.find({}).select("-password").populate("departmentId", "name").sort({ createdAt: -1 })

        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}
