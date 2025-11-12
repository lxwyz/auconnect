
import bcrypt from "bcrypt";
import userModel from "./models/userModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
 
dotenv.config();


export const seedDb = async () => {
    console.log(process.env.MONGO_URI);
    try {
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("Database connection failed: ", err.message);
        process.exit(1);
    }
   try {
     const salt = await bcrypt.genSalt(10);
     const hashPassword = await bcrypt.hash(process.env.SEED_ADMINPASSWORD, salt);
     
        const seedUser = new userModel({
        studentId:process.env.SEED_ID,
        name:process.env.SEED_NAME,
        email:process.env.SEED_EMAIL,
        password: hashPassword,
        role:process.env.SEED_ROLE
        });
         await seedUser.save();
         process.exit(1);

   } catch (error) {
     console.log(error)
   }
}

seedDb();
