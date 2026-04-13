const { USER_ROLES } = require("../../config/constants");
const auth = require("../../middlewares/auth.middleware");
const bodyValidator = require("../../middlewares/request-validate.middleware");
const bookingCtrl = require("./booking.controller");
const { BookingCreateDTO } = require("./booking.validator");

const bookingRouter = require("express").Router();

bookingRouter.post(
  "/",
  auth([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  bodyValidator(BookingCreateDTO),
  bookingCtrl.holdSeats,
);
bookingRouter.post(
  "/confirm",
  auth([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  bookingCtrl.confirmBooking,
);

bookingRouter.post(
  "/cancel",
  auth([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  bookingCtrl.cancelBooking,
);

bookingRouter.get(
  "/",
  auth([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  bookingCtrl.listAllBookings,
);
bookingRouter.get(
  "/dashboard/summary",
  //auth(USER_ROLES.ADMIN),
  bookingCtrl.getDashboardSummary
);
bookingRouter.get(
  "/stats/top-movies",
  bookingCtrl.getTopPerformingMovies,
);
bookingRouter.get(
    "/stats/payment-breakdown", 
    bookingCtrl.getPaymentBreakdown,
);
bookingRouter.get("/stats/weekly-revenue", bookingCtrl.getWeeklyRevenue);
bookingRouter.get(
  "/:bookingId",
  // auth([USER_ROLES.ADMIN, USER_ROLES.CUSTOMER]),
  bookingCtrl.getBookingDetails,
);


bookingRouter.post(
  "/auto-release",
  auth([USER_ROLES.ADMIN]),
  bookingCtrl.autoReleaseExpired,
);

bookingRouter.get("/allbookings/:userId", bookingCtrl.getAllBookingsForUser);
module.exports = bookingRouter;
