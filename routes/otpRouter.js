import express from "express";

import {
  sendOTP,
  verifyOTP,
  forgetPassOTP,
} from "../controllers/otpController.js";

const otpRouter = express.Router();

otpRouter.post("/send-otp", sendOTP); // Route For Resent OTP
otpRouter.post("/verify-otp", verifyOTP); // Route For Verify
otpRouter.post("/forget-pass-otp", forgetPassOTP); // Route For Forget

export default otpRouter;
