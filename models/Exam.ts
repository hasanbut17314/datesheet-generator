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
  },
  { timestamps: true },
)

export default mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema)
