const { required } = require("joi")
const mongoose = require("mongoose")

const AuthSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        required: true
    },
    maskedAccessToken: {
        type: String,
        required: true
    },
     maskedRefreshToken: {
        type: String,
        required: true
    },
    client: {
        type: String,
    }
},{
    timestamps: true,
    autoCreate: true,
    autoIndex: true
})

const AuthModel = mongoose.model("Auth", AuthSchema)
module.exports = AuthModel;