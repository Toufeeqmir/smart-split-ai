import mongoose from 'mongoose';
const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: String, required: true }],
  createdBy: { type: String, required: true },
}, { 
  timestamps: true 
}
);
export default mongoose.model('Group', GroupSchema);
