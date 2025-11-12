import express, { json } from "express";
import { registerUser, verifyOtp ,verifyEmail } from "../controllers/userController.js";
import sendOtpEmail from "../utils/sendOtp.js";
import isAdmin from "../controllers/middlewares/isAdmin.js";

import userModel from "../models/userModel.js";

const useRouter = express.Router();
console.log("✅ router loaded");

// useRouter.get("/test", async (req, res) => {
//     try {
       
//          const {email} = req.body;

//         if(!email){
//             return res.json({"message": "Please Enter Email"})
//         } else{
//         const something =  await sendOtpEmail(email,123);
//         res.json({something})
//         }
//         //sendt  otp
        
//     } catch (error) {
//         console.log(error)
//         res.json({"message": error.message})
//     }
  
// });
    

useRouter.post("/register", registerUser);
useRouter.post("/verify-otp", verifyOtp);

useRouter.use(isAdmin);
useRouter.get("/getusers", async(req,res)=>{
        // console.log(req)
 try {
    
    const users = await userModel.find({});
    // const usersToJson =  JSON.stringify(users);
    console.log("It Works")
    res.json(users)
    // res.json(usersToJson)
 } catch (error) {
    res.json({message:"error"})
 }
})





export default useRouter;
