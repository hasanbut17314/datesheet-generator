import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Exam from "@/models/Exam"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const exam = await Exam.findById(params.id)
      .populate({
        path: "courseId",
        select: "name code",
        populate: {
          path: "facultyId",
          select: "name email",
        },
      })
      .populate("dateSheetId", "name")

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json(exam)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const data = await req.json()

    // Check for clashes if date, time, or venue is being updated
    if (data.date || data.startTime || data.endTime || data.venue) {
      const currentExam = await Exam.findById(params.id)

      if (!currentExam) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 })
      }

      const queryDate = data.date ? new Date(data.date) : currentExam.date
      const queryStartTime = data.startTime || currentExam.startTime
      const queryEndTime = data.endTime || currentExam.endTime
      const queryVenue = data.venue || currentExam.venue

      const existingExams = await Exam.find({
        _id: { $ne: params.id },
        dateSheetId: currentExam.dateSheetId,
        date: queryDate,
        $or: [
          {
            startTime: { $lte: queryEndTime },
            endTime: { $gte: queryStartTime },
          },
          {
            venue: queryVenue,
            startTime: { $lte: queryEndTime },
            endTime: { $gte: queryStartTime },
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
    }

    const exam = await Exam.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json(exam)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update exam" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const exam = await Exam.findByIdAndDelete(params.id)

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Exam deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 })
  }
}
