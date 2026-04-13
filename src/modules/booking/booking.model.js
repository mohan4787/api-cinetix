
const { required } = require("joi");
const mongoose = require("mongoose");

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
const BookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieId: {
      type: mongoose.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    showtimeId: {
      type: mongoose.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    seats: [SeatSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["reserved", "confirmed", "cancelled"],
      default: "reserved",
    },
     expiresAt: { type: Date, required: true },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    autoCreate: true,
    autoIndex: true,
  },
);
const BookingModel = mongoose.model("Booking", BookingSchema);

module.exports = BookingModel;
