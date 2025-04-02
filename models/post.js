const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  postUrl: {
    type: String,
    required: true,
    trim: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Post', postSchema);
