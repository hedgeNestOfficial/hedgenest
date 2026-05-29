const mongoose = require ('mongoose')
const userProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User',
            required: true
        },
        gender:{
            type: String,
            required:true
        },
        occupation:{
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        role:{
            type: String,
            default: "user"
        },
        bvn: {
            type: String,
            required: false
        },
        nin: {
            type: String,
            required: false
        },
        profileImage: {
            type: String,
            default: null,
            required: false
        }
    },{timestamps: true}
)

module.exports = mongoose.model('UserProfile', userProfileSchema)