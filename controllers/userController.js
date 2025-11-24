// Packages
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Packages

import userModel from "../models/userModel.js";
import { buildQuery } from "../utils/queryHelper.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
import { sendError, sendSuccess } from "../utils/responseHandler.js";

// import { sendOTP, createOTP, updateOTP } from "./otpController.js";

import messages from "../utils/messages.js";
import OtpModel from "../models/otpModel.js";
import { createOTP } from "./otpController.js";

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
      if (existingUser.isVerify) {
        return sendError(res, messages.EMAIL_TAKEN, 401);
      } else if (!existingUser.isVerify) {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        existingUser.studentId = studentId;
        existingUser.name = name;
        existingUser.password = hashPassword;
        const updatedUser = await existingUser.save();

        console.log(updateUser);
        await createOTP(email, updatedUser.userId);

        // 8️⃣ Send OTP email
        // await sendOtpEmail(email, updatedOTP);

        return sendSuccess(res, messages.OTP_SENT, {
          userid: existingUser.userId,
        });
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      const userId = uuidv4();
      console.log(userId);

      const newUser = new userModel({
        studentId,
        name,
        userId,
        email,
        password: hashPassword,
      });
      await newUser.save();

      await createOTP(email, newUser.userId);

      // 8️⃣ Send OTP email
      //await sendOtpEmail(email, otp);

      return sendSuccess(res, messages.OTP_SENT, { userid: userId });
    }
  } catch (error) {
    console.log(error);
    sendError(res, messages.INTERNAL_ERROR, 500, error);
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
          { id: user._id, role: user.role, email: user.email },
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

const updateUser = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    sendError(res, messages.INTERNAL_ERROR, 500, error);
  }
};

export { registerUser, login, getUser };
