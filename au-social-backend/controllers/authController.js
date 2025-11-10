import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel";
import { registerValidator,loginValidator } from "../validators/authValidators";

export const register = async (req,res) => {
    try {
        const {error} = registerValidator.validate(req.body);
        if(error) return res.status(400).json({message: error.details[0].message});

        const {studentId,name,email,password} = req.body;

        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message: "User already exists"});

        const hashPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({
            studentId,
            name,
            email,
            password:hashPassword
        })

        const token = jwt.sign(
            {id: newUser._id,email: newUser.email},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                name:newUser.name,
                email: newUser.email,

            }
        });

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}
