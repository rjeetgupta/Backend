import mongoose, { Schema } from "mongoose";

const subcriptionSchema = new Schema({
    subcriber: {
        type: Schema.Type.ObjectId,
        ref: "User"
    },

    channel: {
        type: Schema.Type.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const Subcription = mongoose.model("Subcription", subcriptionSchema);