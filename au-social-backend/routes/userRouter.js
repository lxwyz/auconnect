import express from "express";
import { registerUser, verifyOtp } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/verify-otp",verifyOtp)

export default userRouter;
