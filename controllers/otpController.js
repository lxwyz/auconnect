/*
IMPORTANT NOTE ALL The  res.json will be replace with Send ERROR OR SEND SUCCESS

Sent Email Are all Commented We don't need real Email to Use Just For The Testing Purpose
Just Use console .log ()
*/

//Packages
import otpGenerator from "otp-generator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mongose Model
import OtpModel from "../models/otpModel.js";
import userModel from "../models/userModel.js";

// Utils
import { sendError, sendSuccess } from "../utils/responseHandler.js";
import messages from "../utils/messages.js";
import sendOtpEmail from "../utils/sendOtpEmail.js";

// Helper Function (Check Mail Cool Down Retrun Object )
const checkCooldown = (existingOtp) => {
  const currentDate = new Date();
  const lastSend = existingOtp.lastSentAt;
  const COOLDOWN_5M_MS = 5 * 60 * 1000;
  const COOLDOWN_30s_MS = 30 * 1000;
  const timeSinceLastSen = Math.abs(currentDate.getTime() - lastSend.getTime());

  if (existingOtp.resendCount < 3) {
    if (timeSinceLastSen < COOLDOWN_30s_MS) {
      return {
        shouldWait: true,
        messages: "Too Many Request Please Try again After 30 Seconds",
      };
    }
  } else {
    if (timeSinceLastSen < COOLDOWN_5M_MS) {
      return {
        shouldWait: true,
        messages: "Too Many Request Please Try again After 5 Min",
      };
    } else {
      existingOtp.resendCount = 0;
    }
  }
  return { shouldWait: false, message: "" };
};

// Helper Function (Create OR Update OTP Return OTP)
const createOTP = async (email, userId, existingOtp) => {
  // Creart OTP
  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  // Hash IT here
  const otpHash = await bcrypt.hash(otp, 10);
  // Create THE DOC
  const updatedOtp = await OtpModel.findOneAndUpdate(
    { userId }, // Filter
    {
      $set: {
        otpHash,
        email,
        attempts: 0,
        lastSentAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes (or 2 minutes if you prefer the other logic)
      },
      $inc: { resendCount: 1 }, // Atomically increment resendCount
    },
    {
      new: true, // Return the updated document
      upsert: true, // Create a new document if none is found
      setDefaultsOnInsert: true,
    }
  );
  console.log(`Generated OTP : ${otp}`);
  return otp;
};

// Controller For RESent  OTP
const sendOTP = async (req, res) => {
  const { userId } = req.body;

  const user = await userModel.findOne({ userId });
  //  Verify user exists
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  //  Only allow OTP for unverified users
  if (user.isVerify) {
    return res.status(400).json({ message: "User already verified" });
  }

  // Check existing OTP
  const existingOtp = await OtpModel.findOne({ userId });

  if (existingOtp) {
    // Check The Cool Down
    const cooldownCheck = checkCooldown(existingOtp);
    if (cooldownCheck.shouldWait) {
      // Will Change Later with Send Error
      return res.status(400).json({ messages: cooldownCheck.messages });
    }
  }

  /// Create OTP
  const otp = await createOTP(user.email, userId, existingOtp);

  // 5️⃣ Send OTP to user (email/SMS)
  // await sendOtpEmail(user.email, otp);
  // console.log("Generated OTP:", otp);

  return res.json({ message: "OTP sent successfully" });
};

// Controller For Forget Pass OTP
const forgetPassOTP = async (req, res) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email });

  //  Verify user exist
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const existingOtp = await OtpModel.findOne({ userId: user.userId });
  // Verify OTP exist
  if (existingOtp) {
    const cooldownCheck = checkCooldown(existingOtp);
    if (cooldownCheck.shouldWait) {
      return res.status(400).json({ messages: cooldownCheck.messages });
    }
  }
  // Create OTP OR Update
  await createOTP(email, user.userId, existingOtp);
  return sendSuccess(res, messages.OTP_SENT);
};

// Controller Verify OTP And Give Token  (Token Include UID ROLE EMAIL )
const verifyOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;

    const userOTP = await OtpModel.findOne({ email });
    // Check OTP exist
    if (!userOTP) {
      return res.json({ success: false, message: "User not found" });
    }
    // Is OTP  Expire
    if (userOTP.expiresAt < new Date()) {
      return res.json({ sucess: false, message: "OTP expired." });
    }
    /// Is Limit Reached Limit Attempt 3
    else if (userOTP.attempts > 2) {
      return res.json({
        sucess: false,
        message: "MAX Attempt Reach. Please Request New OTP",
      });
    }

    const isMatch = await bcrypt.compare(otp, userOTP.otpHash);
    // NOT Match ++ Attempt
    if (!isMatch) {
      userOTP.attempts += 1;
      await userOTP.save();
      return res.json({
        sucess: false,
        message: `Invalid OTP Your Attempt chance left : ${
          3 - userOTP.attempts
        } `,
      });
    } else {
      const user = await userModel.findOne({ email });
      console.log(user);
      const token = jwt.sign(
        { id: user.userId, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
      user.isVerify = true;
      await user.save();

      userOTP.otpHash = null;
      userOTP.attempts = 0;
      userOTP.resendCount = 0;
      userOTP.expiresAt = null;

      await userOTP.save();

      res.json({ success: true, token });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// const createOTP = async (email, userId) => {
//   const otp = otpGenerator.generate(6, {
//     digits: true,
//     upperCaseAlphabets: false,
//     lowerCaseAlphabets: false,
//     specialChars: false,
//   });
//   const otpHash = await bcrypt.hash(otp, 10);
//   await OtpModel.create({
//     userId,
//     otpHash,
//     attempts: 0,
//     resendCount: 0,
//     lastSentAt: new Date(),
//     expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
//   });

//   // await sendOtpEmail(email, otp);
// };
export { sendOTP, createOTP, verifyOTP, forgetPassOTP };
