import mongoose, { Schema, type Document } from "mongoose"

export interface IDateSheet extends Document {
  name: string
  departmentId: mongoose.Types.ObjectId
  semester: number
  startDate: Date
  endDate: Date
  status: "draft" | "published" | "archived"
  academicYear: string
  examPeriod: string
  createdBy: mongoose.Types.ObjectId
  lastModifiedBy: mongoose.Types.ObjectId
  notificationSent: boolean
  version: number
  notes: string
  constraints: {
    minGapBetweenExams: number // in hours
    maxExamsPerDay: number
    preferredDays: string[]
    blackoutDates: Date[]
  }
}

const DateSheetSchema = new Schema<IDateSheet>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Please provide a department"],
    },
    semester: {
      type: Number,
      required: [true, "Please provide a semester"],
      min: [1, "Semester must be at least 1"],
      max: [8, "Semester cannot be more than 8"],
    },
    startDate: {
      type: Date,
      required: [true, "Please provide a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please provide an end date"],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    academicYear: {
      type: String,
      required: [true, "Please provide academic year"],
    },
    examPeriod: {
      type: String,
      required: [true, "Please provide exam period"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide creator"],
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot be more than 1000 characters"],
    },
    constraints: {
      minGapBetweenExams: {
        type: Number,
        default: 2,
      },
      maxExamsPerDay: {
        type: Number,
        default: 2,
      },
      preferredDays: [{
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      }],
      blackoutDates: [{
        type: Date,
      }],
    },
  },
  { timestamps: true },
)

export default mongoose.models.DateSheet || mongoose.model<IDateSheet>("DateSheet", DateSheetSchema)
