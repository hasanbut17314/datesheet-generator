import mongoose, { Schema, type Document } from "mongoose"

export interface IDepartment extends Document {
  name: string
  code: string
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, "Please provide a department name"],
      unique: true,
      maxlength: [100, "Department name cannot be more than 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Please provide a department code"],
      unique: true,
      maxlength: [10, "Department code cannot be more than 10 characters"],
    },
  },
  { timestamps: true },
)

export default mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema)
