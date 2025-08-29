import mongoose, { Schema } from "mongoose";

// name, desc, video, owner
const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    video: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }

}, { timestamps: true });

export const Playlist = mongoose.model("PlayList", playlistSchema);