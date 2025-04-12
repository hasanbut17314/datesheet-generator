import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import DateSheet from "@/models/DateSheet"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const datesheet = await DateSheet.findByIdAndUpdate(
      params.id,
      { status: "published" },
      { new: true, runValidators: true },
    )

    if (!datesheet) {
      return NextResponse.json({ error: "Datesheet not found" }, { status: 404 })
    }

    return NextResponse.json(datesheet)
  } catch (error) {
    return NextResponse.json({ error: "Failed to publish datesheet" }, { status: 500 })
  }
}
