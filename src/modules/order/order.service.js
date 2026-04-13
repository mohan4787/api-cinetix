const Order = require("./order.model");
const BookingService = require("../booking/booking.service");
const ShowTimeModel = require("../showtime/showtime.model");
const { default: axios } = require("axios");
const { PaymentConfig, AppConfig } = require("../../config/config");
const mongoose = require("mongoose");
const BookingModel = require("../booking/booking.model");
const orderModel = require("./order.model");

class OrderService {
  async createOrder(payload) {
    const { bookingId } = payload;

    const orderExists = await Order.findOne({ bookingId });
    if (orderExists) throw new Error("Order already exists for this booking");

    const bookingDetail = await BookingService.getBookingById(bookingId);

    const order = await Order.create({
      ...payload,
      totalAmount: bookingDetail.totalAmount,
      seats: bookingDetail.seats,
      paymentStatus: "pending",
    });

    return order;
  }

  async initiatePayment(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    const alreadyPaid = await Order.findOne({ _id: orderId, pidx: { $ne: null }, paymentStatus: "paid" });
    if (alreadyPaid) {
      return { throw: "Payment already completed for this order" };
    }

    const alreadyInitiated = await Order.findOne({ _id: orderId, pidx: { $ne: null } });
    if (alreadyInitiated) {
      return {
        throw: "Payment already initiated for this order",
        pidx: alreadyInitiated.pidx,
        payment_url: `https://test-pay.khalti.com/?pidx=${alreadyInitiated.pidx}`,
      };
    }

    const response = await axios.post(
      PaymentConfig.khalti.url + "epayment/initiate/",
      {
        return_url: `${AppConfig.nextjsUrl}/payment-success`,
        website_url: AppConfig.nextjsUrl,
        amount: order.totalAmount * 100,
        purchase_order_id: order._id.toString(),
        purchase_order_name: "Movie Ticket Booking",
      },
      {
        headers: {
          Authorization: `Key ${PaymentConfig.khalti.secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;
    if (!data.pidx) throw new Error("Payment initiation failed");

    order.pidx = data.pidx;
    order.paymentMethod = "khalti";
    await order.save();

    return {
      pidx: data.pidx,
      payment_url: `https://test-pay.khalti.com/?pidx=${data.pidx}`,
    };
  }

  async verifyPayment({ pidx }) {
    const order = await Order.findOne({ pidx });
    if (!order) throw new Error("Order not found");
    const BookingDetail = await BookingModel.findById(order.bookingId).populate("userId", "name email").populate("movieId", "title");

    if (order.paymentStatus === "paid") return {
      data: BookingDetail,
      message:"Payment already verified for this order",
      status: "ALREADY_VERIFIED",
    };

    const { data: khaltiData } = await axios.post(
      `${PaymentConfig.khalti.url}epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${PaymentConfig.khalti.secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!khaltiData || khaltiData.status !== "Completed") {
      order.paymentStatus = "failed";
      await order.save();
      throw new Error(`Payment not completed: ${khaltiData.status || "Unknown"}`);
    }

    if (khaltiData.total_amount !== order.totalAmount * 100) {
      order.paymentStatus = "failed";
      await order.save();
      throw new Error("Payment amount mismatch");
    }

    order.paymentStatus = "paid";
    order.transactionId = khaltiData.transaction_id;
    await order.save();

    const booking = await BookingService.confirmBooking(order.bookingId, order.userId);
  
    if (!booking || !booking.showtimeId || !booking.seats) {
      throw new Error("Booking or seats data missing");
    }

      await ShowTimeModel.updateOne(
      { _id: booking.showtimeId },
      { $set: { "seats.$[elem].status": "booked" } },
      { arrayFilters: [{ "elem.seatNumber": { $in: booking.seats.map(s => s.seatNumber) } }] }
    );

const bookingDetail = await BookingModel.findById({
  _id: booking._id,
}).populate("movieId", "title")

    return {
      orderId: order._id,
      booking:bookingDetail,
      paymentStatus: order.paymentStatus,
    };
  } 


  async getOrdersByUser(userId) {
    return await Order.find({ userId }).sort({ createdAt: -1 });
  }
}

module.exports = new OrderService();