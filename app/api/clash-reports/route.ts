import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import ClashReport from "@/models/ClashReport"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get("status")

    const query: any = {}

    if (status) query.status = status

    // If student, only show their reports
    if (session.user.role === "student") {
      query.studentId = session.user.id
    }

    const clashReports = await ClashReport.find(query)
      .populate("studentId", "name email")
      .populate({
        path: "examIds",
        populate: {
          path: "courseId",
          select: "name code",
        },
      })
      .sort({ createdAt: -1 })

    return NextResponse.json(clashReports)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clash reports" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const data = await req.json()

    // Set the student ID from the session
    data.studentId = session.user.id

    const clashReport = await ClashReport.create(data)
    return NextResponse.json(clashReport, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create clash report" }, { status: 500 })
  }
}
