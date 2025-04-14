import mongoose, { Schema, type Document } from "mongoose"

export interface IExam extends Document {
  courseId: mongoose.Types.ObjectId
  dateSheetId: mongoose.Types.ObjectId
  date: Date
  startTime: string
  endTime: string
  venue: string
  type: "midterm" | "final" | "quiz" | "other"
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  facultyId: mongoose.Types.ObjectId
  roomCapacity: number
  requiredResources: string[]
  duration: number // in minutes
  isOnline: boolean
  maxStudents: number
  prerequisites: string[]
  notes: string
}

const ExamSchema = new Schema<IExam>(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Please provide a course"],
    },
    dateSheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DateSheet",
      required: [true, "Please provide a datesheet"],
    },
    date: {
      type: Date,
      required: [true, "Please provide a date"],
    },
    startTime: {
      type: String,
      required: [true, "Please provide a start time"],
    },
    endTime: {
      type: String,
      required: [true, "Please provide an end time"],
    },
    venue: {
      type: String,
      required: [true, "Please provide a venue"],
    },
    type: {
      type: String,
      enum: ["midterm", "final", "quiz", "other"],
      default: "final",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a faculty member"],
    },
    roomCapacity: {
      type: Number,
      required: [true, "Please provide room capacity"],
    },
    requiredResources: [{
      type: String,
    }],
    duration: {
      type: Number,
      required: [true, "Please provide exam duration in minutes"],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    maxStudents: {
      type: Number,
      required: [true, "Please provide maximum number of students"],
    },
    prerequisites: [{
      type: String,
    }],
    notes: {
      type: String,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },
  },
  { timestamps: true },
)

export default mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema)
