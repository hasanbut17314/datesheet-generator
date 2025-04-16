import mongoose, { Schema, type Document } from "mongoose"

export interface ICourse extends Document {
  _id: string
  code: string
  name: string
  departmentId: mongoose.Types.ObjectId
  facultyId: mongoose.Types.ObjectId
  semester: number
  creditHours: number
}

const CourseSchema = new Schema<ICourse>(
  {
    code: {
      type: String,
      required: [true, "Please provide a course code"],
      unique: true,
      maxlength: [10, "Course code cannot be more than 10 characters"],
    },
    name: {
      type: String,
      required: [true, "Please provide a course name"],
      maxlength: [100, "Course name cannot be more than 100 characters"],
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Please provide a department"],
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a faculty member"],
    },
    semester: {
      type: Number,
      required: [true, "Please provide a semester"],
      min: [1, "Semester must be at least 1"],
      max: [8, "Semester cannot be more than 8"],
    },
    creditHours: {
      type: Number,
      required: [true, "Please provide credit hours"],
      min: [1, "Credit hours must be at least 1"],
    },
  },
  { timestamps: true },
)

export default mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema)
