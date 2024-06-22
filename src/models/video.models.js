import mongoose, { Schema } from 'mongoose';

import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
// Help in writing mongoDB aggregations pipeline

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,  // cloudinary url
            required: true
        },
        thumbnailFile: {
            type: String,  // cloudinary url
            required: true
        },
        title: {
            type: String,  
            required: true
        },
        description: {
            type: String,  
            required: true
        },
        duration: {
            type: Number,  // cloudinary give the duration after upload the video
            required: true
        },
        views: {
            type: Number,  
            default: 0
        },
        isPublished: {
            type: Boolean,  
            default: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate);
// Used as a plugin to aggregate

export const Video = mongoose.model("Video", videoSchema);