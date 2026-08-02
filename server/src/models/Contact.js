import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true, maxlength: 100 },
  email:   { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  subject: { type: String, default: "", trim: true, maxlength: 200 },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  isRead:  { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model("Contact", contactSchema)
