import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";


dotenv.config();
const app = express();

connectDB();

const PORT = process.env.PORT || 8000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
