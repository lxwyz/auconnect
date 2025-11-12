import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { sendOtpEmail } from "../utils/sendOtp.js";

const registerUser = async (req, res) => {
  try {
    const {
      studentId,
      name,
      email,
      password,
      // faculty,
      // dob,
      // phone,
      // address,
      // year,
      role
    } = req.body;

    if (!studentId || !name || !email || !password) {
      return res.json({
        success: false,
        message: "Please fill all the required fields.",
      });
    }

    if (!validator.isEmail(email) || !email.endsWith("@au.edu")) {
      return res.json({
        success: false,
        message: "Only Assumption University email is allowed.",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5minutes.

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      studentId,
      name,
      email,
      // faculty,
      // dob,
      // phone,
      // address,
      // year,
      password: hashPassword,
      otp,
      otpExpiry,
      role,
    });

    const user = await newUser.save();

    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "7d",
    // });

    // 8️⃣ Send OTP email
    await sendOtpEmail(email, otp);

    res.json({ success: true, message: "OTP sent to your email." });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.json({ sucess: false, message: "Invalid OTP." });
    }

    if (user.otpExpiry < new Date()) {
      return res.json({ sucess: false, message: "OTP expired." });
    }

    //clear OTP fields after successful verification.
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user._id ,role:user.role}, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};





const  verifyEmail = async (req,res)=>{
     try {
    const {
      studentId,
      name,
      email,
      password,
      faculty,
      dob,
      phone,
      address,
      year,
    } = req.body;

    if (!studentId || !name || !email || !password) {
      return res.json({
        success: false,
        message: "Please fill all the required fields.",
      });
    }

    if (!validator.isEmail(email) || !email.endsWith("@au.edu")) {
      return res.json({
        success: false,
        message: "Only Assumption University email is allowed.",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5minutes.

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      studentId,
      name,
      email,
      faculty,
      dob,
      phone,
      address,
      year,
      password: hashPassword,
      otp,
      otpExpiry,
    });

    const user = await newUser.save();

    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "7d",
    // });

    // 8️⃣ Send OTP email
    await sendOtpEmail(email, otp);

    res.json({ success: true, message: "OTP sent to your email." });

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
    
}
export { registerUser, verifyOtp ,verifyEmail };
