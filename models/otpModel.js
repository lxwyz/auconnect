import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String, require: true, unique: true },
  otpHash: { type: String }, // hashed OTP
  attempts: { type: Number, default: 0 }, // how many times user entered OTP
  resendCount: { type: Number, default: 0 }, // how many times OTP got resent
  expiresAt: { type: Date }, // expiration time
  lastSentAt: { type: Date }, // last time OTP was sent
});

const OtpModel = mongoose.model("OTP", otpSchema);

export default OtpModel;
