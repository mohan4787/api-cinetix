const mongoose = require("mongoose");
const { Status } = require("../../config/constants");
const { ref } = require("pdfkit");

const SeatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "reserved", "booked"],
    default: "available",
  },
});

const ShowTimeSchema = new mongoose.Schema({
    movieId: {
      type: mongoose.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    screen: {
      type: String,
      required: true,
      enum: ["SCREEN1", "SCREEN2", "SCREEN3"], // optional but recommended
    },

    price:{
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    // ✅ ADD THIS
    seats: {
      type: [SeatSchema],
      default: [],
    },

    // ✅ OPTIONAL (good practice)
    status: {
      type: String,
      enum: Object.values(Status || { ACTIVE: "active", INACTIVE: "inactive" }),
      default: "active",
    },
    language: {
      type: String,
      default: "English",
    },
  },
  {
    autoCreate: true,
    timestamps: true,
    autoIndex: true,
  }
);

const ShowTimeModel = mongoose.model("Showtime", ShowTimeSchema);

module.exports = ShowTimeModel;