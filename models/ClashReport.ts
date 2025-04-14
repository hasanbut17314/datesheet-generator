import mongoose, { Schema, type Document } from "mongoose"

export interface IClashReport extends Document {
  studentId: mongoose.Types.ObjectId
  examIds: mongoose.Types.ObjectId[]
  description: string
  status: "pending" | "resolved" | "rejected"
  createdAt: Date
  resolvedAt?: Date
  priority: "low" | "medium" | "high" | "critical"
  impact: string
  suggestedResolution?: string
  resolvedBy?: mongoose.Types.ObjectId
  resolutionNotes?: string
  affectedStudents: number
  type: "time" | "venue" | "faculty" | "resource" | "other"
  attachments?: string[]
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
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    impact: {
      type: String,
      required: [true, "Please provide impact description"],
      maxlength: [200, "Impact description cannot be more than 200 characters"],
    },
    suggestedResolution: {
      type: String,
      maxlength: [500, "Suggested resolution cannot be more than 500 characters"],
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionNotes: {
      type: String,
      maxlength: [1000, "Resolution notes cannot be more than 1000 characters"],
    },
    affectedStudents: {
      type: Number,
      required: [true, "Please provide number of affected students"],
      min: [1, "At least one student must be affected"],
    },
    type: {
      type: String,
      enum: ["time", "venue", "faculty", "resource", "other"],
      required: [true, "Please provide conflict type"],
    },
    attachments: [{
      type: String,
    }],
  },
  { timestamps: true },
)

export default mongoose.models.ClashReport || mongoose.model<IClashReport>("ClashReport", ClashReportSchema)
