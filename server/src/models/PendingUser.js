import mongoose from "mongoose";

const PendingUserSchema = new mongoose.Schema({
     username: {type: String, required: true},
     email: { type: String, required: true, unique: true},
     password: { type: String, required: true},
     avatar: { type: String, default: ""},
      otp: { type: String, required: true},
      otpExpiry: { type: Date, required: true},
},
{ timesStamp: true}
 );

 PendingUserSchema.index({ createdAt: 1}, {expireAfterSeconds: 600});

 export default mongoose.model("PendingUser", PendingUserSchema);