import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import ClashReport from "@/models/ClashReport"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const clashReport = await ClashReport.findById(params.id)
      .populate("studentId", "name email")
      .populate({
        path: "examIds",
        populate: {
          path: "courseId",
          select: "name code",
        },
      })

    if (!clashReport) {
      return NextResponse.json({ error: "Clash report not found" }, { status: 404 })
    }

    // If student, verify they own this report
    if (session.user.role === "student" && clashReport.studentId._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(clashReport)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clash report" }, { status: 500 })
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

    // If resolving, set resolvedAt
    if (data.status === "resolved" || data.status === "rejected") {
      data.resolvedAt = new Date()
    }

    const clashReport = await ClashReport.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    })

    if (!clashReport) {
      return NextResponse.json({ error: "Clash report not found" }, { status: 404 })
    }

    return NextResponse.json(clashReport)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update clash report" }, { status: 500 })
  }
}
