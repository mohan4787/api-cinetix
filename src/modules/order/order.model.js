const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    bookingId: {
      type: mongoose.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    movieId: { type: mongoose.Types.ObjectId, ref: "Movie" },
    showtimeId: { type: mongoose.Types.ObjectId, ref: "Showtime" },
    seats: [{ seatNumber: String, price: Number }],
    totalAmount: { type: Number, required: false },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["created", "confirmed", "cancelled"],
      default: "created",
    },
    pidx: {
      type: String,
      default: null,
    },
    transactionId: String,
    paymentMethod: { type: String, enum: ["khalti", "esewa", "card"] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", OrderSchema);
