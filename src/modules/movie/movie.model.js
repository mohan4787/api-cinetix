const mongoose = require("mongoose");
const { Status } = require("../../config/constants");

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 2,
    max: 100,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    default: null,
  },
  genre: {
    type: [String],
    default: [],
  },
  duration: {
    type: Number,
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  poster: {
    publicId: String,
    secureUrl: String,
    optimizedUrl: String,
  },

  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },

  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.INACTIVE,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    default: null
  },

  updatedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    default: null
  }

}, {
  autoIndex: true,
  autoCreate: true,
  timestamps: true
});

const MovieModel = mongoose.model("Movie", MovieSchema);
module.exports = MovieModel;
