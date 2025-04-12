import mongoose, { Schema, type Document } from "mongoose"

export interface IDateSheet extends Document {
  name: string
  departmentId: mongoose.Types.ObjectId
  semester: number
  startDate: Date
  endDate: Date
  status: "draft" | "published" | "archived"
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
  },
  { timestamps: true },
)

export default mongoose.models.DateSheet || mongoose.model<IDateSheet>("DateSheet", DateSheetSchema)
