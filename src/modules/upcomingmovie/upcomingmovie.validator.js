const Joi = require("joi");

const UpcomingMovieCreateDTO = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow(null, "").default(null),
     genre: Joi.array().required(),
    duration: Joi.number().allow(null).default(null),
    expectedReleaseDate: Joi.date().required(),
    language: Joi.string().default("English"),
    poster: Joi.string().allow(null, "").default(null),
    teaserUrl: Joi.string().uri().allow(null, "").default(null),
    status: Joi.string().regex(/^(active|inactive)$/).default("inactive"),
})

const UpcomingMovieUpdateDTO = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow(null, "").default(null),
   genre: Joi.array().required(),
    duration: Joi.number().allow(null).default(null),
    expectedReleaseDate: Joi.date().required(),
    language: Joi.string().default("English"),
    poster: Joi.string().allow(null, "").default(null),
    teaserUrl: Joi.string().uri().allow(null, "").default(null),
    status: Joi.string().regex(/^(active|inactive)$/).default("inactive"),
})

module.exports = {
    UpcomingMovieCreateDTO,
    UpcomingMovieUpdateDTO
}