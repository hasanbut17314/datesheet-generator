import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Course from "@/models/Course"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const departmentId = searchParams.get("departmentId")
    const semester = searchParams.get("semester")
    const facultyId = searchParams.get("facultyId")

    const query: any = {}

    if (departmentId) query.departmentId = departmentId
    if (semester) query.semester = Number.parseInt(semester)
    if (facultyId) query.facultyId = facultyId

    const courses = await Course.find(query).populate("departmentId", "name code").populate("facultyId", "name email")

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
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

    const course = await Course.create(data)
    return NextResponse.json(course, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create course" }, { status: 500 })
  }
}
