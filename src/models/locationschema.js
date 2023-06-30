const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true
  },
  area: {
    type: Number,
    required: true
  },
  orientation: {
    type: Number,
    required: true
  },
  inclination: {
    type: Number,
    required: true
  },
  product: {
    type: String,
    required: true
  },
  latitude: {
    type: String,
    required: true
  },
  longitude: {
    type: String,
    required: true
  },
  powerpeak: {
    type: Number,
    required: false
  }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
