const router = require("express").Router();
const orderCtrl = require("./order.controller");
const auth = require("../../middlewares/auth.middleware");
const bodyValidator = require("../../middlewares/request-validate.middleware");

const { USER_ROLES } = require("../../config/constants");
const orderRouter = require("express").Router();
const {
  OrderCreateDTO,
  OrderVerifyPaymentDTO,
} = require("./order.validator");


orderRouter.post(
  "/",
  // auth([USER_ROLES.ADMIN || USER_ROLES.USER || USER_ROLES.CUSTOMER]),
  bodyValidator(OrderCreateDTO),
  orderCtrl.createOrder
);

orderRouter.post(
  "/initiate-payment/:orderId",
  // auth([USER_ROLES.ADMIN || USER_ROLES.USER || USER_ROLES.CUSTOMER]),
  orderCtrl.initiatePayment
);

orderRouter.post(
  "/verify-payment",
  // auth([USER_ROLES.USER]),
  bodyValidator(OrderVerifyPaymentDTO),
  orderCtrl.verifyPayment
);

orderRouter.get(
  "/my-orders",
  auth([USER_ROLES.ADMIN || USER_ROLES.USER || USER_ROLES.CUSTOMER]),
  orderCtrl.getMyOrders
);

orderRouter.get(
  "/",
  auth([USER_ROLES.ADMIN || USER_ROLES.USER || USER_ROLES.CUSTOMER]),
  orderCtrl.getAllOrders
);

module.exports = orderRouter;