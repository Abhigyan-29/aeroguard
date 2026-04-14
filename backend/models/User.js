const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  alertRegions: [
    {
      country: String,
      lat: Number,
      lng: Number
    }
  ],
  watchlist: [
    {
      eventId: String,
      title: String,
      date: Date,
      category: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
