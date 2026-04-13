const Joi = require("joi");

const BookingCreateDTO = Joi.object({
  userId: Joi.string().required(),
  movieId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  showtimeId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
  seats: Joi.array()
    .items(
      Joi.object({
        seatNumber: Joi.string().min(1).required()
      })
    )
    .min(1)
    .required(),
  totalAmount: Joi.number().required(),
});

const BookingUpdateDTO = Joi.object({
  bookingStatus: Joi.string().valid("reserved", "confirmed", "cancelled"),
  seats: Joi.array().items(
    Joi.object({
      seatNumber: Joi.string().min(1).required()
    })
  ),
  totalAmount: Joi.number().min(0),
});

module.exports = {
  BookingCreateDTO,
  BookingUpdateDTO,
};