import mongoose from "mongoose";

const clubSchema = new mongoose.create({
    clubName: {type: String,required:true},
    description: {type:String,required:true},
    category: {type:String,required: true},
    slotDate:{type:String,required: true},
    userData:{type:Object,required: true},
    contactEmail: {type: String,required: true},
})

export default mongoose.model("Clubs",clubSchema);