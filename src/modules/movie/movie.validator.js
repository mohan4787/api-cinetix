const Joi = require("joi");
const MovieCreateDTO = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow(null, "").default(null),
    genre: Joi.string().required(),
    duration: Joi.number().required(),
    releaseDate: Joi.date().required(),
    language: Joi.string().default("English"),
    rating: Joi.number().min(0).max(10).default(0),
    status: Joi.string().regex(/^(active|inactive)$/).default("inactive"),
    poster: Joi.string().allow(null, "").default(null),
})


const MovieUpdateDTO = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow(null, "").default(null),
    genre: Joi.string().required(),
    duration: Joi.number().required(),
    releaseDate: Joi.date().required(),
    language: Joi.string().default("English"),
    rating: Joi.number().min(0).max(10).default(0),
    status: Joi.string().regex(/^(active|inactive)$/).default("inactive"),
    poster: Joi.string().allow(null, "").default(null),
})

module.exports = {
    MovieCreateDTO,
    MovieUpdateDTO
}