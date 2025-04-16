import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import DateSheet from "@/models/DateSheet"
import Exam from "@/models/Exam"
import Course from "@/models/Course"
import FacultyAvailability from "@/models/FacultyAvailability"
import { detectClashes } from "@/lib/clash-detection"
import { IExam } from "@/models/Exam"
import { IDateSheet } from "@/models/DateSheet"
import { ICourse } from "@/models/Course"
import { IFacultyAvailability } from "@/models/FacultyAvailability"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        await dbConnect()

        const searchParams = req.nextUrl.searchParams
        const dateSheetId = searchParams.get("dateSheetId")

        if (!dateSheetId) {
            return NextResponse.json({ error: "DateSheet ID is required" }, { status: 400 })
        }

        // Get datesheet
        const datesheet = await DateSheet.findById(dateSheetId)
        if (!datesheet) {
            return NextResponse.json({ error: "DateSheet not found" }, { status: 404 })
        }

        // Get exams for this datesheet
        const exams = await Exam.find({ dateSheetId }).populate("courseId")

        // Detect clashes/conflicts
        const clashes = detectClashes(exams)

        // Additional conflict detection logic
        const facultyConflicts = await detectFacultyConflicts(exams)
        const venueConflicts = await detectVenueConflicts(exams)
        const studentConflicts = await detectStudentConflicts(exams, datesheet)

        const allConflicts = [
            ...clashes.map(clash => ({
                type: clash.type,
                description: `${clash.type === "time" ? "Time overlap" : "Venue conflict"} detected between exams`,
                exams: clash.exams
            })),
            ...facultyConflicts,
            ...venueConflicts,
            ...studentConflicts
        ]

        return NextResponse.json({ conflicts: allConflicts })
    } catch (error) {
        console.error("Error detecting conflicts:", error)
        return NextResponse.json({ error: "Failed to detect conflicts" }, { status: 500 })
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
        const { dateSheetId } = data

        if (!dateSheetId) {
            return NextResponse.json({ error: "DateSheet ID is required" }, { status: 400 })
        }

        // Get datesheet
        const datesheet = await DateSheet.findById(dateSheetId)
        if (!datesheet) {
            return NextResponse.json({ error: "DateSheet not found" }, { status: 404 })
        }

        // Get courses for this datesheet (based on department and semester)
        const courses = await Course.find({
            departmentId: datesheet.departmentId,
            semester: datesheet.semester
        })

        // Get faculty availability
        const facultyAvailability = await FacultyAvailability.find({
            dateSheetId
        })

        // Generate schedule
        const result = await generateSchedule(datesheet, courses, facultyAvailability)

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error scheduling exams:", error)
        return NextResponse.json({ error: "Failed to schedule exams" }, { status: 500 })
    }
}

// Helper functions for conflict detection
async function detectFacultyConflicts(exams: IExam[]) {
    // Group exams by date and faculty
    const conflicts = []
    const facultyExamMap = new Map()

    for (const exam of exams) {
        const facultyId = exam.facultyId.toString()
        const dateKey = new Date(exam.date).toDateString()
        const timeKey = `${exam.startTime}-${exam.endTime}`
        const key = `${facultyId}-${dateKey}-${timeKey}`

        if (!facultyExamMap.has(key)) {
            facultyExamMap.set(key, [])
        }

        facultyExamMap.get(key).push(exam)
    }

    // Check for conflicts
    for (const [key, exams] of facultyExamMap.entries()) {
        if (exams.length > 1) {
            conflicts.push({
                type: "faculty",
                description: `Faculty has multiple exams scheduled at the same time`,
                exams
            })
        }
    }

    return conflicts
}

async function detectVenueConflicts(exams: IExam[]) {
    // Group exams by date, time, and venue
    const conflicts = []
    const venueExamMap = new Map()

    for (const exam of exams) {
        const venueId = exam.venue
        const dateKey = new Date(exam.date).toDateString()
        const timeKey = `${exam.startTime}-${exam.endTime}`
        const key = `${venueId}-${dateKey}-${timeKey}`

        if (!venueExamMap.has(key)) {
            venueExamMap.set(key, [])
        }

        venueExamMap.get(key).push(exam)
    }

    // Check for conflicts
    for (const [key, exams] of venueExamMap.entries()) {
        if (exams.length > 1) {
            conflicts.push({
                type: "venue",
                description: `Multiple exams scheduled in the same venue at the same time`,
                exams
            })
        }
    }

    return conflicts
}

async function detectStudentConflicts(exams: IExam[], datesheet: IDateSheet) {
    // This is a simplification. In a real system, you would need to check actual student enrollments
    // For now, we'll assume all students in a semester might have conflicts if exams are on the same day

    const conflicts = []
    const dateExamMap = new Map()

    // Group exams by date
    for (const exam of exams) {
        const dateKey = new Date(exam.date).toDateString()

        if (!dateExamMap.has(dateKey)) {
            dateExamMap.set(dateKey, [])
        }

        dateExamMap.get(dateKey).push(exam)
    }

    // Check if there are more exams per day than allowed in constraints
    for (const [dateKey, dayExams] of dateExamMap.entries()) {
        if (dayExams.length > datesheet.constraints.maxExamsPerStudentPerDay) {
            conflicts.push({
                type: "student",
                description: `More than ${datesheet.constraints.maxExamsPerStudentPerDay} exams scheduled on ${dateKey}, which exceeds the daily limit for students`,
                exams: dayExams
            })
        }
    }

    return conflicts
}

async function generateSchedule(datesheet: IDateSheet, courses: ICourse[], facultyAvailability: IFacultyAvailability[]) {
    // Get existing exams
    const existingExams = await Exam.find({ dateSheetId: datesheet._id })

    // If exams already exist for all courses, just validate them
    if (existingExams.length >= courses.length) {
        const conflicts = await validateExistingSchedule(existingExams, datesheet)
        return {
            success: conflicts.length === 0,
            scheduledExams: existingExams,
            conflicts
        }
    }

    // Create new exams for unscheduled courses
    const scheduledExams = [...existingExams]
    const conflicts = []

    // Calculate date range
    const startDate = new Date(datesheet.startDate)
    const endDate = new Date(datesheet.endDate)
    const dateRange = getDatesInRange(startDate, endDate)

    // Filter out blackout dates
    const availableDates = dateRange.filter(date =>
        !datesheet.constraints.blackoutDates.some(blackoutDate =>
            new Date(blackoutDate).toDateString() === date.toDateString()
        )
    )

    // Filter by preferred days if specified
    let schedulableDates = availableDates
    if (datesheet.constraints.preferredDays && datesheet.constraints.preferredDays.length > 0) {
        schedulableDates = availableDates.filter(date =>
            datesheet.constraints.preferredDays.includes(getDayName(date))
        )
    }

    // Get available time slots
    const morningSlot = { start: datesheet.examTimings.morningStart, end: datesheet.examTimings.morningEnd }
    const afternoonSlot = { start: datesheet.examTimings.afternoonStart, end: datesheet.examTimings.afternoonEnd }
    const timeSlots = [morningSlot, afternoonSlot]

    // Get courses that don't have exams yet
    const scheduledCourseIds = scheduledExams.map(exam => exam.courseId.toString())
    const unscheduledCourses = courses.filter(course =>
        !scheduledCourseIds.includes(course._id.toString())
    )

    // Organize faculty availability
    const facultyAvailabilityMap = new Map()
    for (const availability of facultyAvailability) {
        facultyAvailabilityMap.set(availability.facultyId.toString(), availability)
    }

    // Schedule each unscheduled course
    for (const course of unscheduledCourses) {
        let scheduled = false

        // Check faculty availability
        const facultyId = course.facultyId
        const faculty = facultyAvailabilityMap.get(facultyId.toString())

        // Get faculty unavailable dates
        const facultyUnavailableDates = faculty?.unavailableDates || []

        // Filter dates based on faculty availability
        const facultyAvailableDates = schedulableDates.filter(date =>
            !facultyUnavailableDates.some((unavailableDate: any) =>
                new Date(unavailableDate).toDateString() === date.toDateString()
            )
        )

        // Try to schedule exam on available dates
        for (const date of facultyAvailableDates) {
            for (const timeSlot of timeSlots) {
                // Check for existing exams on this date and time
                const hasConflict = scheduledExams.some(exam =>
                    new Date(exam.date).toDateString() === date.toDateString() &&
                    ((exam.startTime <= timeSlot.end && exam.endTime >= timeSlot.start) ||
                        (exam.venue === "default-venue" && exam.startTime === timeSlot.start)) // Simple venue conflict check
                )

                if (!hasConflict) {
                    // Create a new exam
                    const newExam = {
                        courseId: course._id,
                        dateSheetId: datesheet._id,
                        date,
                        startTime: timeSlot.start,
                        endTime: timeSlot.end,
                        venue: "default-venue", // This should be replaced with actual venue assignment logic
                        type: datesheet.examPeriod.toLowerCase(),
                        status: "scheduled",
                        facultyId: course.facultyId,
                        duration: 180, // 3 hours in minutes - should be configurable
                        isOnline: false,
                        maxStudents: 40, // Default value - should be configurable
                        roomCapacity: 45, // Default value - should be configurable
                        requiredResources: ["desks", "projector"],
                        prerequisites: []
                    }

                    // Add to scheduled exams
                    const createdExam = await Exam.create(newExam)
                    scheduledExams.push(createdExam)
                    scheduled = true
                    break
                }
            }

            if (scheduled) break
        }

        if (!scheduled) {
            conflicts.push({
                type: "scheduling",
                description: `Could not find a suitable time slot for ${course.code} - ${course.name}`,
                exams: [{ courseId: course }]
            })
        }
    }

    // Validate the final schedule
    const validationConflicts = await validateExistingSchedule(scheduledExams, datesheet)
    conflicts.push(...validationConflicts)

    return {
        success: conflicts.length === 0,
        scheduledExams,
        conflicts
    }
}

async function validateExistingSchedule(exams: IExam[], datesheet: IDateSheet) {
    // Check for various conflicts in the existing schedule
    const conflicts = []

    // Call our conflict detection methods
    const clashes = detectClashes(exams)
    const facultyConflicts = await detectFacultyConflicts(exams)
    const venueConflicts = await detectVenueConflicts(exams)
    const studentConflicts = await detectStudentConflicts(exams, datesheet)

    // Add all conflicts to the list
    conflicts.push(
        ...clashes.map(clash => ({
            type: clash.type,
            description: `${clash.type === "time" ? "Time overlap" : "Venue conflict"} detected between exams`,
            exams: clash.exams
        })),
        ...facultyConflicts,
        ...venueConflicts,
        ...studentConflicts
    )

    return conflicts
}

// Helper functions
function getDatesInRange(startDate: Date, endDate: Date) {
    const dates = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
}

function getDayName(date: Date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
}