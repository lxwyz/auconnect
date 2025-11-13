import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      // match: [/^[\w-\.]+@au\.edu$/, "Must be an AU email"]
    },
    password: {
      type: String,
      required: true,
    },
    // faculty: {
    //   type: String,
    //   required: true
    // },
    // dob: {
    //   type: String,
    // },
    // address: {
    //   type: Object,
    //   default: { line1: "", line2: "" },
    //   required: true
    // },
    // phone: {
    //   type: String,
    //   default: "0000000",
    // },
    // year: { type: Number, required: true },
    // createdAt: Date,
    // updatedAt: Date,
    otp: String,
    otpExpiry: Date,
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
    status: { type: String, enum: ["Pending", "Active"], default: "Pending" },
  },

  { timestamps: true }
);

export default mongoose.model("User", userSchema);
