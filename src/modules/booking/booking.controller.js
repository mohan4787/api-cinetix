const { getDateRange } = require("../../utilities/helper");
const BookingModel = require("./booking.model");
const bookingSvc = require("./booking.service");

class BookingController {
  async holdSeats(req, res, next) {
    try {
      const booking = await bookingSvc.holdSeats(req.body);

      res.json({
        data: booking,
        message: "Seats held for 5 minutes",
        status: "SEATS_HELD",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async confirmBooking(req, res, next) {
    try {
      const booking = await bookingSvc.confirmBooking(
        req.body.bookingId,
        req.userId,
      );

      res.json({
        data: booking,
        message: "Booking confirmed successfully",
        status: "BOOKING_CONFIRMED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const booking = await bookingSvc.releaseSeats(
        req.body.bookingId,
        req.userId,
      );

      res.json({
        data: booking,
        message: "Booking cancelled successfully",
        status: "BOOKING_CANCELLED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async listAllBookings(req, res, next) {
    try {
      let filter = {};
      if (req.query.userId) {
        filter.createdBy = req.query.userId;
      }

      if (req.query.status) {
        filter.bookingStatus = req.query.status;
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const skip = (page - 1) * limit;

      const bookings = await bookingSvc.getMultipleRowsByFilter(filter, {
        limit: limit,
        skip: skip,
        sort: { createdAt: -1 }, 
      });

      res.json({
        data: bookings, 
        message: "Booking list fetched successfully",
        status: "BOOKING_LIST_FETCHED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async autoReleaseExpired(req, res, next) {
    try {
      await bookingSvc.autoReleaseExpired();

      res.json({
        data: null,
        message: "Expired bookings released",
        status: "BOOKING_AUTO_RELEASE",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getAllBookingsForUser(req, res, next) {
    try {
      const userId = req.params.userId;
      const AllBookings = await BookingModel.find({ userId })
        .populate("movieId", "title")
        .lean();
      if (!AllBookings || AllBookings.length === 0) {
        return res.status(404).json({
          data: null,
          message: "No bookings found for this user",
          status: "USER_BOOKINGS_NOT_FOUND",
          options: null,
        });
      }
      res.json({
        data: AllBookings,
        message: "All bookings for user fetched successfully",
        status: "USER_BOOKINGS_FETCHED",
        options: null,
      });
    } catch (exception) {
      throw exception;
    }
  }

  async getBookingDetails(req, res, next) {
    try {
      const bookingId = req.params.bookingId;
      const booking = await bookingSvc.getBookingById(bookingId);

      if (!booking) {
        return res.status(404).json({
          data: null,
          message: "Booking not found",
          status: "BOOKING_NOT_FOUND",
          options: null,
        });
      }
      res.json({
        data: booking,
        message: "Booking details fetched successfully",
        status: "BOOKING_DETAILS_FETCHED",
      });
    } catch (exception) {
      throw exception;
    }
  }
async getDashboardSummary(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stats = await BookingModel.aggregate([
      {
        $facet: {
          "totalRevenue": [
            { $match: { bookingStatus: 'confirmed' } },
            { $group: { _id: null, sum: { $sum: "$totalAmount" } } }
          ],
          "todayBookings": [
            { $match: { createdAt: { $gte: today }, bookingStatus: 'confirmed' } },
            { $count: "count" }
          ],
          "activeReservations": [
            { $match: { bookingStatus: 'reserved', expiresAt: { $gt: new Date() } } },
            { $count: "count" }
          ]
        }
      }
    ]);

    res.json({
      data: {
        revenue: stats[0].totalRevenue[0]?.sum || 0,
        todayCount: stats[0].todayBookings[0]?.count || 0,
        liveReservations: stats[0].activeReservations[0]?.count || 0
      },
      status: "STATS_FETCHED"
    });
  } catch (error) {
    next(error);
  }
}
async getTopPerformingMovies(req, res, next) {
  try {
    const topMovies = await BookingModel.aggregate([
      // 1. Only count confirmed bookings
      { $match: { bookingStatus: 'confirmed' } },
    
      {
        $group: {
          _id: "$movieId",
          sales: { $sum: "$totalAmount" },
          ticketCount: { $sum: { $size: "$seats" } }
        }
      },

      {
        $lookup: {
          from: "movies", 
          localField: "_id",
          foreignField: "_id",
          as: "movieDetails"
        }
      },

      { $unwind: "$movieDetails" },
      { $sort: { sales: -1 } },

      { $limit: 5 },
      {
        $project: {
          _id: 0,
          name: "$movieDetails.title",
          sales: 1,
          ticketCount: 1
        }
      }
    ]);

    res.json({
      data: topMovies,
      status: "TOP_MOVIES_FETCHED"
    });
  } catch (error) {
    next(error);
  }
}
async getWeeklyRevenue(req, res, next) {
    try {
        // Calculate the date 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyStats = await BookingModel.aggregate([
            {
                $match: {
                    bookingStatus: 'confirmed',
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" },
                    rev: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } } 
        ]);
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const formattedData = weeklyStats.map(item => ({
            day: dayNames[item._id - 1],
            rev: item.rev
        }));

        res.json({
            data: formattedData,
            status: "WEEKLY_STATS_FETCHED"
        });
    } catch (error) {
        next(error);
    }
}
async getPaymentBreakdown(req, res, next) {
    try {
        const dateFilter = getDateRange(req.query);
        const breakdown = await BookingModel.aggregate([
            { $match: { bookingStatus: 'confirmed', ...dateFilter } },
            {
                $group: {
                    _id: { $toLower: "$paymentMethod" },
                    totalRupees: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 1,
                    totalRupees: 1,
                    totalPaisa: { $multiply: ["$totalRupees", 100] },
                    count: 1
                }
            }
        ]);
        res.json({ data: breakdown });
    } catch (error) { next(error); }
}
}

const bookingCtrl = new BookingController();
module.exports = bookingCtrl;
