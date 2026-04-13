const BaseService = require("../../services/base.service");
const Booking = require("./booking.model");
const { getIO } = require("../../utilities/socket");
const ShowTimeModel = require("../showtime/showtime.model");

class BookingService extends BaseService {
  constructor() {
    super(Booking);
  }

async holdSeats(data) {
  const { movieId, showtimeId, seats, userId, totalAmount } = data;
  const seatNumbers = seats.map(s => s.seatNumber);

  if (!movieId || !showtimeId || !userId || !Array.isArray(seats) || seats.length === 0) {
    throw new Error("Invalid input data");
  }

  const EXPIRY_TIME_MS = 5 * 60 * 1000; 
  const expiresAt = new Date(Date.now() + EXPIRY_TIME_MS);

  const conflict = await this.model.findOne({
    showtimeId,
    "seats.seatNumber": { $in: seatNumbers },
    $or: [
      { bookingStatus: "confirmed" },
      { bookingStatus: "reserved" },
    ],
  });

  if (conflict) {
    throw new Error("Some seats are already reserved or booked by another user");
  }

  const booking = await this.model.create({
    userId,
    movieId,
    showtimeId,
    totalAmount,
    seats: seats.map((s) => ({
      seatNumber: s.seatNumber,
      status: "reserved",
    })),
    createdBy: userId,
    bookingStatus: "reserved",
    expiresAt, 
  });

  await ShowTimeModel.updateOne(
    { _id: showtimeId },
    { $set: { "seats.$[elem].status": "reserved" } },
    { arrayFilters: [{ "elem.seatNumber": { $in: seatNumbers } }] }
  );
  const io = getIO();
  if (io) {
    io.to(showtimeId.toString()).emit("seat_locked", {
      seats: seatNumbers,
      status: "reserved"
    });
  }

  setTimeout(async () => {
    const currentBooking = await this.model.findById(booking._id);
    
    if (currentBooking && currentBooking.bookingStatus === "reserved") {
      await ShowTimeModel.updateOne(
        { _id: showtimeId },
        { $set: { "seats.$[elem].status": "available" } },
        { arrayFilters: [{ "elem.seatNumber": { $in: seatNumbers } }] }
      );
      await this.model.updateOne(
        { _id: booking._id },
        { $set: { bookingStatus: "cancelled" } }
      );
      if (io) {
        io.to(showtimeId.toString()).emit("seat_released", {
          seats: seatNumbers,
          status: "available"
        });
      }
      console.log(`Seats ${seatNumbers.join(", ")} released due to timeout.`);
    }
  }, EXPIRY_TIME_MS);

  return booking;
}
  async confirmBooking(bookingId, userId) {
    const booking = await this.findById(bookingId);

    if (!booking) throw new Error("Booking not found");

    if (booking.bookingStatus === "confirmed") {
      return booking;
    }

    if (booking.bookingStatus !== "reserved") {
      throw new Error(`Invalid booking state: ${booking.bookingStatus}`);
    }

    if (booking.expiresAt < new Date()) {
      booking.bookingStatus = "cancelled";
      await booking.save();
      throw new Error("Booking expired");
    }

    booking.seats = booking.seats.map((s) => ({
      ...s.toObject(),
      status: "booked",
    }));

    booking.bookingStatus = "confirmed";
    booking.updatedBy = userId;

    await booking.save();
    return booking;
  }

  async getBookingById(bookingId) {
    const booking = await this.model
      .findById(bookingId)
      .populate("movieId", "title")
      .populate("userId", "name email")
      // .populate("showtimeId")
      .lean();
    if (!booking) throw new Error("Booking not found");
    return booking;
  }


  async releaseSeats(data) {
    const { bookingId, userId } = data;

    const booking = await this.findById(bookingId);

    if (!booking) throw new Error("Booking not found");

    if (booking.bookingStatus !== "reserved") {
      throw new Error("Only reserved bookings can be cancelled");
    }

    booking.bookingStatus = "cancelled";
    booking.updatedBy = userId;

    await booking.save();

    const io = getIO();
    if (io) {
      io.to(booking.showtimeId.toString()).emit("seat_released", {
        seats: booking.seats.map((s) => s.seatNumber),
      });
    }

    return booking;
  }

  async autoReleaseExpired() {
    const now = new Date();

    const expiredBookings = await this.model.find({
      bookingStatus: "reserved",
      expiresAt: { $lt: now },
    });

    const io = getIO();

    for (const booking of expiredBookings) {
      booking.bookingStatus = "cancelled";
      await booking.save();

      if (io) {
        io.to(booking.showtimeId.toString()).emit("seat_released", {
          seats: booking.seats.map((s) => s.seatNumber),
        });
      }
    }
  }
}

module.exports = new BookingService();
