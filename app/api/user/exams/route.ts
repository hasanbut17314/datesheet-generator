import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import Exam from "@/models/Exam"
import Course from "@/models/Course"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()

        const searchParams = req.nextUrl.searchParams
        const dateFilter = searchParams.get("date")
        const courseFilter = searchParams.get("course")

        let exams = []
        const query: any = {}

        if (dateFilter) {
            const date = new Date(dateFilter)
            // Match exams on the same day
            query.date = {
                $gte: new Date(date.setHours(0, 0, 0, 0)),
                $lt: new Date(date.setHours(23, 59, 59, 999)),
            }
        }

        if (courseFilter) {
            query.courseId = courseFilter
        }

        if (session.user.role === "student") {
            // For students, get exams from published datesheets
            // In a real app, you'd filter by the student's courses/department
            const publishedDatesheets = await Exam.find({
                ...query,
                dateSheetId: { $in: await getPublishedDatesheetIds() },
            })
                .populate({
                    path: "courseId",
                    select: "name code",
                })
                .populate("dateSheetId", "name")
                .sort({ date: 1 })

            exams = publishedDatesheets
        } else if (session.user.role === "faculty") {
            // For faculty, get exams for courses they teach
            const facultyCourses = await Course.find({ facultyId: session.user.id }).select("_id")
            const courseIds = facultyCourses.map((course) => course._id)

            exams = await Exam.find({
                ...query,
                courseId: { $in: courseIds },
            })
                .populate({
                    path: "courseId",
                    select: "name code",
                })
                .populate("dateSheetId", "name")
                .sort({ date: 1 })
        } else if (session.user.role === "admin") {
            // For admins, get all exams
            exams = await Exam.find(query)
                .populate({
                    path: "courseId",
                    select: "name code",
                })
                .populate("dateSheetId", "name")
                .sort({ date: 1 })
        }

        return NextResponse.json(exams)
    } catch (error) {
        console.error("Error fetching user exams:", error)
        return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 })
    }
}

// Helper function to get IDs of published datesheets
async function getPublishedDatesheetIds() {
    const DateSheet = require("@/models/DateSheet").default
    const publishedDatesheets = await DateSheet.find({ status: "published" }).select("_id")
    return publishedDatesheets.map((ds: any) => ds._id)
}
