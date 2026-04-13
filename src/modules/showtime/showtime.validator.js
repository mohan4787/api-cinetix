const Joi = require("joi");

const ShowTimeCreateDTO = Joi.object({
  movieId: Joi.string().required(),
  screen: Joi.string().min(1).max(50).required(),
  date: Joi.date().required(),
  price: Joi.number().required(),
  seats: Joi.array().optional(), 
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "startTime must be in HH:mm format",
    }),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "endTime must be in HH:mm format",
    }),
    language: Joi.string().optional(),
});

const ShowTimeUpdateDTO = Joi.object({
  movieId: Joi.string().optional(),
  screen: Joi.string().min(1).max(50).optional(),
  price: Joi.number().optional(),
  date: Joi.date().optional(),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      "string.pattern.base": "startTime must be in HH:mm format",
    }),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      "string.pattern.base": "endTime must be in HH:mm format",
    }),
});

module.exports = {
  ShowTimeCreateDTO,
  ShowTimeUpdateDTO,
};