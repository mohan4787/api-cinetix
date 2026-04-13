const Joi = require("joi");

const OrderCreateDTO = Joi.object({
  bookingId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/),
  userId: Joi.string().required(),
  paymentMethod: Joi.string().valid("khalti", "esewa", "card").required(),
});

const OrderVerifyPaymentDTO = Joi.object({
  pidx: Joi.string().required(),
});

module.exports = {
  OrderCreateDTO,
  OrderVerifyPaymentDTO,
};
