import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRouter.js";

// Utils
import { globalErrorHandler } from "./utils/errorHandler.js";

dotenv.config();
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// API routes
app.use("/api/user", userRouter);

// Handle Generic Error
app.use(globalErrorHandler);

//  Test Route
app.get("/", (req, res) => {
  res.send("API is working well.");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
