import mongoose from "mongoose";

const userSchema = new mongoose.Schema (
    {
        studentId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [/^[\w-\.]+@au\.edu$/, "Must be an AU email"]
        },
        password: {
            type: String,
            required: true,
        },
        avatar: String,
        bio: String,
        interests: [String],
        joinedClubs: [String],
    },
    {timestamps: true}
)

export default mongoose.model("User", userSchema)
