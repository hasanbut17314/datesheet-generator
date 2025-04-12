import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import DateSheet from "@/models/DateSheet"
import Exam from "@/models/Exam"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()
    const datesheet = await DateSheet.findById(params.id).populate("departmentId", "name code")

    if (!datesheet) {
      return NextResponse.json({ error: "Datesheet not found" }, { status: 404 })
    }

    // Get exams for this datesheet
    const exams = await Exam.find({ dateSheetId: params.id }).populate({
      path: "courseId",
      select: "name code",
      populate: {
        path: "facultyId",
        select: "name email",
      },
    })

    return NextResponse.json({
      ...datesheet.toObject(),
      exams,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch datesheet" }, { status: 500 })
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

    const datesheet = await DateSheet.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    })

    if (!datesheet) {
      return NextResponse.json({ error: "Datesheet not found" }, { status: 404 })
    }

    return NextResponse.json(datesheet)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update datesheet" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Delete all exams associated with this datesheet
    await Exam.deleteMany({ dateSheetId: params.id })

    const datesheet = await DateSheet.findByIdAndDelete(params.id)

    if (!datesheet) {
      return NextResponse.json({ error: "Datesheet not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Datesheet and associated exams deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete datesheet" }, { status: 500 })
  }
}
