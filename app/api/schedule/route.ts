import { NextResponse } from "next/server"
import { ExamScheduler } from "@/lib/scheduler"
import connectToDatabase from "@/lib/mongodb"
import DateSheet from "@/models/DateSheet"
import Exam from "@/models/Exam"
import FacultyAvailability from "@/models/FacultyAvailability"

export async function POST(req: Request) {
    try {
        await connectToDatabase()

        const { dateSheetId } = await req.json()

        if (!dateSheetId) {
            return NextResponse.json(
                { error: "Date sheet ID is required" },
                { status: 400 }
            )
        }

        // Fetch all required data
        const dateSheet = await DateSheet.findById(dateSheetId)
        if (!dateSheet) {
            return NextResponse.json(
                { error: "Date sheet not found" },
                { status: 404 }
            )
        }

        const exams = await Exam.find({ dateSheetId })
        const facultyAvailability = await FacultyAvailability.find({ dateSheetId })

        // Create scheduler instance
        const scheduler = new ExamScheduler(
            dateSheet,
            exams,
            facultyAvailability,
            {
                minGapBetweenExams: dateSheet.constraints.minGapBetweenExams,
                maxExamsPerDay: dateSheet.constraints.maxExamsPerDay,
                preferredDays: dateSheet.constraints.preferredDays,
                blackoutDates: dateSheet.constraints.blackoutDates,
            }
        )

        // Schedule exams
        const result = scheduler.scheduleExams()

        // Update exams in database
        if (result.success) {
            for (const exam of result.scheduledExams) {
                await Exam.findByIdAndUpdate(exam._id, {
                    date: exam.date,
                    startTime: exam.startTime,
                    status: "scheduled",
                })
            }
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error scheduling exams:", error)
        return NextResponse.json(
            { error: "Failed to schedule exams" },
            { status: 500 }
        )
    }
}

export async function GET(req: Request) {
    try {
        await connectToDatabase()

        const { searchParams } = new URL(req.url)
        const dateSheetId = searchParams.get("dateSheetId")

        if (!dateSheetId) {
            return NextResponse.json(
                { error: "Date sheet ID is required" },
                { status: 400 }
            )
        }

        // Fetch all required data
        const dateSheet = await DateSheet.findById(dateSheetId)
        if (!dateSheet) {
            return NextResponse.json(
                { error: "Date sheet not found" },
                { status: 404 }
            )
        }

        const exams = await Exam.find({ dateSheetId })
        const facultyAvailability = await FacultyAvailability.find({ dateSheetId })

        // Create scheduler instance
        const scheduler = new ExamScheduler(
            dateSheet,
            exams,
            facultyAvailability,
            {
                minGapBetweenExams: dateSheet.constraints.minGapBetweenExams,
                maxExamsPerDay: dateSheet.constraints.maxExamsPerDay,
                preferredDays: dateSheet.constraints.preferredDays,
                blackoutDates: dateSheet.constraints.blackoutDates,
            }
        )

        // Detect conflicts
        const conflicts = scheduler.detectConflicts()

        return NextResponse.json({ conflicts })
    } catch (error) {
        console.error("Error detecting conflicts:", error)
        return NextResponse.json(
            { error: "Failed to detect conflicts" },
            { status: 500 }
        )
    }
} 