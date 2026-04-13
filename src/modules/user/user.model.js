const mongoose = require("mongoose");
const { USER_ROLES, Status, GENDER } = require("../../config/constants");


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 2,
    max: 50,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.CUSTOMER,
  },
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.INACTIVE,
  },
  address: {
    billingAddress: String,
    shippingAddress: String,
  },
  phone: {
    type: String,
  },
  gender: {
    type: String,
    enum: Object.values(GENDER),
  },
  dob: Date,
  activationToken: String,
  forgetPasswordToken: String,
  expiryTime: Date,
  image: {
    publicId: String,
    secureUrl: String,
    optimizedUrl: String,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    default: null,
  },
  updatedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    default: null,
  },
},{
    autoCreate: true,
    autoIndex: true,
    timestamps: true
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
