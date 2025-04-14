import { IExam } from "@/models/Exam"
import { IDateSheet } from "@/models/DateSheet"
import { IFacultyAvailability } from "@/models/FacultyAvailability"

interface SchedulingConstraints {
    minGapBetweenExams: number
    maxExamsPerDay: number
    preferredDays: string[]
    blackoutDates: Date[]
}

interface SchedulingResult {
    success: boolean
    scheduledExams: IExam[]
    conflicts: {
        type: string
        description: string
        exams: IExam[]
    }[]
}

export class ExamScheduler {
    private dateSheet: IDateSheet
    private exams: IExam[]
    private facultyAvailability: IFacultyAvailability[]
    private constraints: SchedulingConstraints

    constructor(
        dateSheet: IDateSheet,
        exams: IExam[],
        facultyAvailability: IFacultyAvailability[],
        constraints: SchedulingConstraints
    ) {
        this.dateSheet = dateSheet
        this.exams = exams
        this.facultyAvailability = facultyAvailability
        this.constraints = constraints
    }

    private checkFacultyAvailability(exam: IExam, date: Date, timeSlot: string): boolean {
        const faculty = this.facultyAvailability.find(f => f.facultyId.toString() === exam.facultyId.toString())
        if (!faculty) return false

        // Check if date is in unavailable dates
        if (faculty.unavailableDates.some(d => d.getTime() === date.getTime())) {
            return false
        }

        // Check if time slot is in preferred time slots
        const day = date.toLocaleDateString('en-US', { weekday: 'long' })
        return faculty.preferredTimeSlots.some(slot =>
            slot.day === day &&
            slot.startTime <= timeSlot &&
            slot.endTime >= timeSlot
        )
    }

    private checkRoomAvailability(exam: IExam, date: Date, timeSlot: string): boolean {
        // Check if room is already booked for this time slot
        const conflictingExams = this.exams.filter(e =>
            e.venue === exam.venue &&
            e.date.getTime() === date.getTime() &&
            e.startTime === timeSlot
        )
        return conflictingExams.length === 0
    }

    private checkStudentConflicts(exam: IExam, date: Date, timeSlot: string): boolean {
        // This would need to be implemented based on student enrollment data
        // For now, return true as a placeholder
        return true
    }

    private findAvailableTimeSlot(exam: IExam): { date: Date; timeSlot: string } | null {
        const startDate = new Date(this.dateSheet.startDate)
        const endDate = new Date(this.dateSheet.endDate)

        for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
            // Skip blackout dates
            if (this.constraints.blackoutDates.some(d => d.getTime() === date.getTime())) {
                continue
            }

            // Skip non-preferred days
            const day = date.toLocaleDateString('en-US', { weekday: 'long' })
            if (this.constraints.preferredDays.length > 0 && !this.constraints.preferredDays.includes(day)) {
                continue
            }

            // Check available time slots for the day
            const timeSlots = this.generateTimeSlots(date)
            for (const timeSlot of timeSlots) {
                if (
                    this.checkFacultyAvailability(exam, date, timeSlot) &&
                    this.checkRoomAvailability(exam, date, timeSlot) &&
                    this.checkStudentConflicts(exam, date, timeSlot)
                ) {
                    return { date, timeSlot }
                }
            }
        }
        return null
    }

    private generateTimeSlots(date: Date): string[] {
        // Generate time slots based on constraints
        // For now, return a simple array of time slots
        return ['09:00', '11:00', '14:00', '16:00']
    }

    public scheduleExams(): SchedulingResult {
        const scheduledExams: IExam[] = []
        const conflicts: SchedulingResult['conflicts'] = []

        for (const exam of this.exams) {
            const timeSlot = this.findAvailableTimeSlot(exam)
            if (timeSlot) {
                exam.date = timeSlot.date
                exam.startTime = timeSlot.timeSlot
                scheduledExams.push(exam)
            } else {
                conflicts.push({
                    type: 'scheduling',
                    description: `Could not find available time slot for exam ${exam._id}`,
                    exams: [exam]
                })
            }
        }

        return {
            success: conflicts.length === 0,
            scheduledExams,
            conflicts
        }
    }

    public detectConflicts(): SchedulingResult['conflicts'] {
        const conflicts: SchedulingResult['conflicts'] = []

        // Check for faculty conflicts
        const facultyExams = new Map<string, IExam[]>()
        this.exams.forEach(exam => {
            const facultyId = exam.facultyId.toString()
            if (!facultyExams.has(facultyId)) {
                facultyExams.set(facultyId, [])
            }
            facultyExams.get(facultyId)?.push(exam)
        })

        facultyExams.forEach((exams, facultyId) => {
            const faculty = this.facultyAvailability.find(f => f.facultyId.toString() === facultyId)
            if (faculty) {
                const dailyExams = new Map<string, IExam[]>()
                exams.forEach(exam => {
                    const date = exam.date.toISOString().split('T')[0]
                    if (!dailyExams.has(date)) {
                        dailyExams.set(date, [])
                    }
                    dailyExams.get(date)?.push(exam)
                })

                dailyExams.forEach((dailyExams, date) => {
                    if (dailyExams.length > faculty.maxExamsPerDay) {
                        conflicts.push({
                            type: 'faculty',
                            description: `Faculty ${facultyId} has ${dailyExams.length} exams scheduled on ${date}`,
                            exams: dailyExams
                        })
                    }
                })
            }
        })

        // Check for room conflicts
        const roomExams = new Map<string, IExam[]>()
        this.exams.forEach(exam => {
            if (!roomExams.has(exam.venue)) {
                roomExams.set(exam.venue, [])
            }
            roomExams.get(exam.venue)?.push(exam)
        })

        roomExams.forEach((exams, venue) => {
            const timeSlots = new Map<string, IExam[]>()
            exams.forEach(exam => {
                const key = `${exam.date.toISOString().split('T')[0]}-${exam.startTime}`
                if (!timeSlots.has(key)) {
                    timeSlots.set(key, [])
                }
                timeSlots.get(key)?.push(exam)
            })

            timeSlots.forEach((conflictingExams, timeSlot) => {
                if (conflictingExams.length > 1) {
                    conflicts.push({
                        type: 'venue',
                        description: `Multiple exams scheduled in ${venue} at ${timeSlot}`,
                        exams: conflictingExams
                    })
                }
            })
        })

        return conflicts
    }
} 