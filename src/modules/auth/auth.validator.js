const Joi = require("joi");
const EmailDTO = Joi.string().email().required();
const PasswordDTO = Joi.string().min(8).max(25).required();

const RegisterDTO = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: EmailDTO,
    password:Joi.string().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_])[A-Za-z\d!@#$%^&*()_]{8,25}$/
  ).required(),
    confirmPassword: Joi.string().equal(Joi.ref("password")).required().messages({"any.only":"Password and ConfirmPassword must be same"}),
    phone: Joi.string().max(21).allow(null,"").optional().default(null),
    address: Joi.object({
        billingAddress: Joi.string().max(150).allow(null,"").default(null),
        shippingAddress: Joi.string().max(150).allow(null,"").default(null)
    }).allow(null,"").default(null),
    role: Joi.string().allow('customer','admin').default("customer"),
    gender: Joi.string().allow('male','female','other').optional().default(null),
    image: Joi.string().allow(null,"").optional().default(null)
})
const loginDTO = Joi.object({
    email: EmailDTO,
    password: PasswordDTO
})

const ResetPasswordRequestDTO = Joi.object({
    email:EmailDTO
})

const ResetPasswordDataDTO = Joi.object({
     password:Joi.string().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_])[A-Za-z\d!@#$%^&*()_]{8,25}$/
  ).required(),
    confirmPassword: Joi.string().equal(Joi.ref("password")).required().messages({"any.only":"Password and ConfirmPassword must be same"}),
})

module.exports = {
    RegisterDTO,
    loginDTO,
    ResetPasswordDataDTO,
    ResetPasswordRequestDTO
}