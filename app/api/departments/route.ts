import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Department from "@/models/Department"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    const departments = await Department.find({})
    return NextResponse.json(departments)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
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

    const department = await Department.create(data)
    return NextResponse.json(department, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create department" }, { status: 500 })
  }
}
