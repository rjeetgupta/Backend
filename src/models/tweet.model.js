import mongoose, {Schema} from "mongoose";

const tweetSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 280
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {timestamps: true}
)

export const Tweet = mongoose.model("Tweet", tweetSchema);