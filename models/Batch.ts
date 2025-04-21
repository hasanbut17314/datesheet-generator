import mongoose from "mongoose"

const batchSchema = new mongoose.Schema({
    sessionYear: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

export default mongoose.models.Batch || mongoose.model("Batch", batchSchema)