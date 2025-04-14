import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Course from "@/models/Course"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const course = await Course.findById(params.id)
      .populate("departmentId", "name")
      .populate("facultyId", "name")

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Convert MongoDB document to plain object
    const courseObject = course.toObject()
    delete courseObject.__v

    // Convert ObjectIds to strings
    courseObject._id = courseObject._id.toString()
    if (courseObject.departmentId) {
      courseObject.departmentId = courseObject.departmentId.toString()
    }
    if (courseObject.facultyId) {
      courseObject.facultyId = courseObject.facultyId.toString()
    }

    return NextResponse.json(courseObject)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
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

    const course = await Course.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    }).populate("departmentId", "name").populate("facultyId", "name")

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Convert MongoDB document to plain object
    const courseObject = course.toObject()
    delete courseObject.__v

    // Convert ObjectIds to strings
    courseObject._id = courseObject._id.toString()
    if (courseObject.departmentId) {
      courseObject.departmentId = courseObject.departmentId.toString()
    }
    if (courseObject.facultyId) {
      courseObject.facultyId = courseObject.facultyId.toString()
    }

    return NextResponse.json(courseObject)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update course" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const courseId = params.id
    const deletedCourse = await Course.findByIdAndDelete(courseId)

    if (!deletedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
