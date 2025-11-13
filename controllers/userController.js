import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

import { buildQuery } from "../utils/queryHelper.js";
import { sendOtpEmail } from "../utils/sendOtp.js";
import { sendError, sendSuccess } from "../utils/responseHandler.js";

import messages from "../utils/messages.js";

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
    } = req.body;

    if (!studentId || !name || !email || !password) {
      return sendError(
        res,
        messages.MISSING_CREDENTIAL,
        400,
        "studentID, Name , Email And Password Are Require."
      );
    }

    if (!validator.isEmail(email) || !email.endsWith("@au.edu")) {
      return sendError(
        res,
        messages.INVALID_CREDENTIAL,
        401,
        "Only AU Email is Allowed"
      );
    }

    if (password.length < 8) {
      return sendError(
        res,
        messages.INVALID_CREDENTIAL,
        401,
        "Password must be at least 8 characters."
      );
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      if (existingUser.status === "Active") {
        return sendError(res, messages.EMAIL_TAKEN, 401);
      } else if (existingUser.status === "Pending") {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5minutes.

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        existingUser.studentId = studentId;
        existingUser.name = name;
        existingUser.password = hashPassword;
        existingUser.otp = otp;
        existingUser.otpExpiry = otpExpiry;
        await existingUser.save();

        // 8️⃣ Send OTP email
        await sendOtpEmail(email, otp);
        return sendSuccess(res, messages.OTP_SENT);
      }
    } else {
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
      });

      const user = await newUser.save();
      // 8️⃣ Send OTP email
      await sendOtpEmail(email, otp);

      return sendSuccess(res, messages.OTP_SENT);
    }
  } catch (error) {
    console.log(error);
    sendError(res, messages.INTERNAL_ERROR, 500, error);
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
    user.status = "Active";
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return sendError(res, messages.INVALID_REQUEST, 400);
    try {
      const user = await userModel.findOne({ email });
      if (!user) return sendError(res, messages.USER_NOT_FOUND, 404);
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return sendError(res, messages.INVALID_CREDENTIAL, 401);
      else {
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );
        const { _id, studentId, email } = user;
        sendSuccess(res, messages.LOGIN_SUCESS, {
          token,
          _id,
          studentId,
          email,
        });
      }
    } catch (error) {
      console.log(error);
      sendError(res, messages.INTERNAL_ERROR, 500, error);
    }
  } catch (error) {
    sendError(res, messages.INTERNAL_ERROR, 500, error);
  }
};

const getUser = async (req, res) => {
  // u6825079@au.edu

  try {
    const userID = req.params.id;
    if (!userID) return sendError(res, messages.USER_ID_IS_REQUIRE, 400);
    const user = await userModel.findById(userID);
    if (!user) return sendError(res, messages.USER_NOT_FOUND, 404);

    /// Need To Work ON What We Will Return
    sendSuccess(res, messages.USER_RETRIEVED, user);
  } catch (error) {
    sendError(res, messages.INTERNAL_ERROR, 500, error);
  }
};
const getUsers = async (req, res) => {
  // u6825079@au.edu

  try {
    const { page, limit, skip, sortQuery, search, fields } = buildQuery(req);

    const users = await userModel
      .find(search)
      .skip(skip)
      .limit(limit)
      .sort(sortQuery)
      .select(fields || "-password");

    const totalUsers = await userModel.countDocuments(search);

    sendSuccess(
      res,
      `${messages.USER_RETRIEVED} Number Of Users ${totalUsers}`,
      users
    );
  } catch (error) {
    sendError(res, messages.INTERNAL_ERROR, 500, error);
  }
};

const verifyEmail = async (req, res) => {
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
};
export { registerUser, verifyOtp, login, getUser, getUsers };
