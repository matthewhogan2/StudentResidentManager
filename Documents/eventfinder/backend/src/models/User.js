const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({ //required
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: { //reuired unique
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String,
    required: true
  },
  savedEvents: [ // created at upadated at..
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
