const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    age: { type: Number },
    class: { type: String },
    subjects: [{ type: String }],
    attendance: { type: Number }, // percentage
    email: { type: String },
    phone: { type: String },
    department: { type: String, index: true },
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Performance: helpful indexes
employeeSchema.index({ name: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ attendance: -1 });

module.exports = mongoose.model("Employee", employeeSchema);
