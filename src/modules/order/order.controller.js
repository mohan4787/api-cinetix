const orderModel = require("./order.model");
const orderService = require("./order.service");

class OrderController {
  async createOrder(req, res, next) {
    try {
      const payload = req.body;

      const order = await orderService.createOrder(payload);

      res.status(201).json({
        data: order,
        message: "Order created. Proceed to payment",
        status: "ORDER_CREATED",
      });
    } catch (err) {
      next(err);
    }
  }
  async initiatePayment(req, res, next) {
    try {
      const orderId = req.params.orderId;
      const data = await orderService.initiatePayment(orderId);

      res.status(200).json({
        message: "Payment initiated",
        status: "PAYMENT_INITIATE",
        data,
      });
    } catch (err) {
      next(err);
    }
  }
  async verifyPayment(req, res, next) {
    try {
      const { pidx } = req.body;
      const result = await orderService.verifyPayment({ pidx });

      res.status(200).json({
        data: result,
        message: "Payment successful. Tickets generated",
        status: "PAYMENT_SUCCESS",
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const orders = await orderService.getOrdersByUser(req.userId);

      res.status(200).json({
        data: orders,
        message: "Orders fetched successfully",
        status: "ORDERS_FETCHED",
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllOrders(req, res, next) {
    try {
      const getAllOrders = await orderModel.find();
      res.status(200).json({
        data: getAllOrders,
        message: "All orders fetched successfully",
        status: "ORDERS_FETCHED",
      });
    } catch (exception) {
      throw exception;
    }
  }
}

module.exports = new OrderController();
