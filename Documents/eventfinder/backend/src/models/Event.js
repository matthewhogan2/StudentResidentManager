const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String },
  date: { type: String },
  time: { type: String },
  location: { type: String },
  description: { type: String },
  image: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  saveCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
