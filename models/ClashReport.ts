import mongoose, { Schema, type Document } from "mongoose"

export interface IClashReport extends Document {
  studentId: mongoose.Types.ObjectId
  examIds: mongoose.Types.ObjectId[]
  description: string
  status: "pending" | "resolved" | "rejected"
  createdAt: Date
  resolvedAt?: Date
}

const ClashReportSchema = new Schema<IClashReport>(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a student"],
    },
    examIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: [true, "Please provide exams"],
      },
    ],
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending",
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

export default mongoose.models.ClashReport || mongoose.model<IClashReport>("ClashReport", ClashReportSchema)
