const bcrypt = require("bcryptjs");
const cloudinarySvc = require("../../services/cloudinary.service");
const { Status } = require("../../config/constants");
const { randomStringGenerator } = require("../../utilities/helper");
const { AppConfig } = require("../../config/config");
const emailSvc = require("../../services/email.service");
const UserModel = require("../user/user.model");
const AuthModel = require("./auth.model");
const userSvc = require("../user/user.service");

class AuthService {
  async transformUserCreate(req) {
    try {
      const data = req.body;
      if (req.file) {
        data.image = await cloudinarySvc.fileUpload(req.file.path, "/user/");
      }
      data.password = bcrypt.hashSync(data.password, 12);
      data.status = Status.INACTIVE;
      data.activationToken = randomStringGenerator(100);
      const {confirmPassword, ...mappedData} = data;
      return mappedData;
    } catch (exception) {
      throw exception;
    }
  }

 

  async sendActivationNotification(user) {
    try {
      await emailSvc.sendEmail({
        to: user.email,
        sub: "Account activation",
        msg: `Dear ${user.name},thank for registering with us.
         <br> Please click the link below to activate your account <br> 
         <a href="${AppConfig.frontendUrl}/activate/${user.activationToken}">Activate Account</a>
         regards,
         System Administration,
         Please do not reply to this email. Contact support if you have any questions.
         Note: Please copy the link incase the button is not working: ${AppConfig.frontendUrl}/activate/${user.activationToken}`,
      });
    } catch (exception) {
      throw exception;
    }
  }

  async newUserWelcomeEmail(user) {
    try {
      return emailSvc.sendEmail({
        to:user.email,
        sub: "Welcom to our platform",
        msg: 
      `Dear ${user.name},
      <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎬 Welcome to MovieTicket</h1>
            </div>
            <div style="padding: 40px 20px; text-align: center;">
              <h2 style="color: #333333; margin-top: 0;">Account Activated Successfully!</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6;">Your account has been activated and you're ready to start booking movie tickets.</p>
              <div style="margin: 30px 0;">
                <a href="${AppConfig.frontendUrl}/login" style="background-color: #667eea; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Get Started Now</a>
              </div>
              <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
              <p style="color: #999999; font-size: 14px;">Enjoy exclusive movie offers and early access to bookings.</p>
            </div>
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
              <p style="margin: 0;">Please do not reply to this email. Contact support if you have any questions.<br>© 2024 MovieTicket. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>`
      })
    } catch (exception) {
      throw exception;
    }
  }
  createAuthData = async(data) => {
    try {
      const auth = new AuthModel(data)
      return await auth.save()
    } catch (exception) {
      throw exception
    }
  }
  getSingleRowByFilter = async(filter) => {
    try {
      const auth = await AuthModel.findOne(filter)
      return auth;
    } catch (exception) {
      throw exception
    }
  }
  logoutUser = async(token) => {
    try {
      const accessToken = token.replace("Bearer ", "");
      const authData = await this.getSingleRowByFilter({
        maskedAccessToken: accessToken
      })
      if(!authData) {
        throw {
          code: 401,
          message: "Token is not valid",
          status: "TOKEN_NOT_VALID"
        }
      }
      const authDel = await AuthModel.findOneAndDelete({maskedAccessToken: accessToken});
      return authDel
    } catch (exception) {
      throw exception
    }
  }

  logoutFromAll = async(filter) => {
    try {
      const authDel = await AuthModel.deleteMany(filter)
      return authDel
    } catch (exception) {
      throw exception
    }
  }

  updateSingleRowByFilter = async(filter, data) => {
    try {
      const response = await AuthModel.findOneAndUpdate(filter,{$set: data}, {new: true})
      return response;
    } catch (exception) {
      throw exception
    }
  }
  sendPasswordResetRequestEmail = async(userData) => {
    try {
      return await emailSvc.sendEmail({
        to: userData.email,
        sub: "Password reset request",
        msg: `Dear ${userData.name},
        <html>
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 Password Reset Request</h1>
          </div>
          <div style="padding: 40px 20px;">
            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-top: 0;">We received a request to reset your password. Click the button below to proceed:</p>
            <div style="margin: 30px 0; text-align: center;">
          <a href="${AppConfig.nextjsUrl}/reset-password?token=${userData.forgetPasswordToken}" style="background-color: #667eea; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Reset Password</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
            <p style="color: #666666; font-size: 14px; line-height: 1.6;">If the button doesn't work, copy and paste this link in your browser:</p>
            <p style="background-color: #f9f9f9; padding: 12px; border-left: 4px solid #667eea; word-break: break-all; color: #667eea; font-size: 13px; margin: 15px 0;">${AppConfig.nextjsUrl}/reset-password?token=${userData.forgetPasswordToken}</p>
            <p style="color: #ff6b6b; font-size: 14px; font-weight: bold; margin: 20px 0;">⏰ This link expires in 3 hours</p>
            <p style="color: #666666; font-size: 14px; line-height: 1.6;">If you did not request a password reset, please ignore this email. Your account remains secure.</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">Please do not reply to this email. Contact support if you have any questions.<br>© 2024 MovieTicket. All rights reserved.</p>
          </div>
        </div>
          </body>
        </html>`,
      })
    } catch (exception) {
      throw exception
    }
  }
  verifyPasswordResetToken = async(token) => {
    try {
      const userDetail = await userSvc.getSingleUserByFilter({
        forgetPasswordToken: token
      });
      if(!userDetail){
        throw {
          code: 422,
          message: "Token not found, try again resetting password",
          status: "RESET_TOKEN_NOT_FOUND"
        }
      }
      let tokenExpiry = userDetail.expiryTime.getTime();
      const nowTime = Date.now();
      if(tokenExpiry < nowTime) {
        throw {
          code: 422,
          message: "Token has expired, try again resetting password",
          status: "RESET_TOKEN_EXPIRED"
        }
      }
      return userDetail
    } catch (exception) {
      throw exception
    }
  }
  sendPasswordResetSuccessEmail = async(userData) => {
    try {
      return await emailSvc.sendEmail({
        to: userData.email,
        sub: "Password Reset Successful",
        msg: `Dear ${userData.name},
        <html>
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Password Reset Successful</h1>
          </div>
          <div style="padding: 40px 20px;">
            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-top: 0;">Your password has been successfully reset. Thank you for keeping your account secure!</p>
            <div style="background-color: #f0f7ff; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px;">
          <p style="color: #333333; font-size: 14px; margin: 0;"><strong>Important:</strong> For your security, you have been logged out from all devices. Please log in again with your new password.</p>
            </div>
            <div style="margin: 30px 0; text-align: center;">
          <a href="${AppConfig.frontendUrl}/login" style="background-color: #667eea; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Login Now</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
            <p style="color: #666666; font-size: 14px; line-height: 1.6;">If you did not request this password reset or have concerns about your account security, please contact our support team immediately.</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">Please do not reply to this email. Contact support if you have any questions.<br>© 2024 MovieTicket. All rights reserved.</p>
          </div>
        </div>
          </body>
        </html>`,
      })
    } catch (exception) {
      throw exception
    }
  }
}

const  authSvc = new AuthService()
module.exports = authSvc;
