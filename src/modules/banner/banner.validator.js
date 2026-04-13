const Joi = require("joi");
const { Status } = require("../../config/constants");

const BannerCreateDTO = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    link: Joi.string().uri().allow(null,'').default(null),
    status: Joi.string().regex(/^(active|inactive)$/).default(Status.INACTIVE),
    image: Joi.string().allow(null, "").default(null)
})
const BannerUpdateDTO = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    link: Joi.string().uri().allow(null,'').default(null),
    status: Joi.string().regex(/^(active|inactive)$/).default(Status.INACTIVE),
    image: Joi.string().allow(null, "").default(null)
})

module.exports = {
    BannerCreateDTO,
    BannerUpdateDTO
}