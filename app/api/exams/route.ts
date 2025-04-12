import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Course from "@/models/Course"
import DateSheet from "@/models/DateSheet"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const searchParams = req.nextUrl.searchParams
    const dateSheetId = searchParams.get("dateSheetId")
    const courseId = searchParams.get("courseId")
    const date = searchParams.get("date")

    const query: any = {}

    if (dateSheetId) query.dateSheetId = dateSheetId
    if (courseId) query.courseId = courseId
    if (date) query.date = new Date(date)

    const exams = await Exam.find(query)
      .populate({
        path: "courseId",
        select: "name code",
        populate: {
          path: "facultyId",
          select: "name email",
        },
      })
      .populate("dateSheetId", "name")

    return NextResponse.json(exams)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 })
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

    // Validate that the course exists
    const course = await Course.findById(data.courseId)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Validate that the datesheet exists
    const datesheet = await DateSheet.findById(data.dateSheetId)
    if (!datesheet) {
      return NextResponse.json({ error: "Datesheet not found" }, { status: 404 })
    }

    // Check for clashes
    const existingExams = await Exam.find({
      dateSheetId: data.dateSheetId,
      date: new Date(data.date),
      $or: [
        {
          startTime: { $lte: data.endTime },
          endTime: { $gte: data.startTime },
        },
        {
          venue: data.venue,
          startTime: { $lte: data.endTime },
          endTime: { $gte: data.startTime },
        },
      ],
    })

    if (existingExams.length > 0) {
      return NextResponse.json(
        {
          error: "Exam clash detected. There is already an exam scheduled at this time or venue.",
          clashes: existingExams,
        },
        { status: 409 },
      )
    }

    const exam = await Exam.create(data)
    return NextResponse.json(exam, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create exam" }, { status: 500 })
  }
}
