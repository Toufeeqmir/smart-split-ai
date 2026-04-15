import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
  username:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password  = await bcrypt.hash(this.password, salt);
     next();
});

UserSchema.methods.matchPassword = async function(eneterPassword){
   return await bcrypt.compare(eneterPassword, this.password);
}
export default mongoose.model('User', UserSchema);
