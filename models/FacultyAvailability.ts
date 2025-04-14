import mongoose, { Schema, type Document } from "mongoose"

export interface IFacultyAvailability extends Document {
    facultyId: mongoose.Types.ObjectId
    dateSheetId: mongoose.Types.ObjectId
    availableDates: Date[]
    unavailableDates: Date[]
    preferredTimeSlots: {
        day: string
        startTime: string
        endTime: string
    }[]
    maxExamsPerDay: number
    maxExamsPerWeek: number
    preferredVenues: string[]
    notes: string
    lastUpdated: Date
}

const FacultyAvailabilitySchema = new Schema<IFacultyAvailability>(
    {
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Please provide a faculty member"],
        },
        dateSheetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DateSheet",
            required: [true, "Please provide a datesheet"],
        },
        availableDates: [{
            type: Date,
        }],
        unavailableDates: [{
            type: Date,
        }],
        preferredTimeSlots: [{
            day: {
                type: String,
                enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                required: true,
            },
            startTime: {
                type: String,
                required: true,
            },
            endTime: {
                type: String,
                required: true,
            },
        }],
        maxExamsPerDay: {
            type: Number,
            default: 2,
            min: [1, "Maximum exams per day must be at least 1"],
        },
        maxExamsPerWeek: {
            type: Number,
            default: 4,
            min: [1, "Maximum exams per week must be at least 1"],
        },
        preferredVenues: [{
            type: String,
        }],
        notes: {
            type: String,
            maxlength: [500, "Notes cannot be more than 500 characters"],
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
)

export default mongoose.models.FacultyAvailability || mongoose.model<IFacultyAvailability>("FacultyAvailability", FacultyAvailabilitySchema) 