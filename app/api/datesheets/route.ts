import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import DateSheet from "@/models/DateSheet"
import Exam from "@/models/Exam"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const departmentId = searchParams.get("departmentId")
    const semester = searchParams.get("semester")
    const status = searchParams.get("status")

    const query: any = {}

    if (departmentId) query.departmentId = departmentId
    if (semester) query.semester = Number.parseInt(semester)
    if (status) query.status = status

    const datesheets = await DateSheet.find(query).populate("departmentId", "name code")

    // Get exam count for each datesheet
    const dateSheetsWithExamCount = await Promise.all(
      datesheets.map(async (datesheet) => {
        const examCount = await Exam.countDocuments({ dateSheetId: datesheet._id })
        return {
          ...datesheet.toObject(),
          examCount,
        }
      }),
    )

    return NextResponse.json(dateSheetsWithExamCount)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch datesheets" }, { status: 500 })
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

    const datesheet = await DateSheet.create(data)
    return NextResponse.json(datesheet, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create datesheet" }, { status: 500 })
  }
}
