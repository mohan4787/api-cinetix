const bcrypt = require("bcryptjs");
const cloudinarySvc = require("../../services/cloudinary.service");
const { Status } = require("../../config/constants");
const { AppConfig } = require("../../config/config");
const emailSvc = require("../../services/email.service");
const AuthModel = require("./auth.model");
const userSvc = require("../user/user.service");
const { randomNumberGenerator } = require("../../utilities/helper");


class AuthService {
  async transformUserCreate(req) {
    try {
      const data = req.body;
      if (req.file) {
        data.image = await cloudinarySvc.fileUpload(req.file.path, "/user/");
      }
      data.password = bcrypt.hashSync(data.password, 12);
      data.status = Status.INACTIVE;
      
      // Changed from 100 to 6 for a user-friendly Activation Token (OTP)
      data.activationToken = randomNumberGenerator(6) 
      
      const { confirmPassword, ...mappedData } = data;
      return mappedData;
    } catch (exception) {
      throw exception;
    }
  }

  async sendActivationNotification(user) {
    try {
      await emailSvc.sendEmail({
        to: user.email,
        sub: "Verify your CineTix Account",
        msg: `
        <html>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #e5e7eb;">
              <div style="background-color: #dc2626; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -1px;">🎬 CineTix Verification</h1>
              </div>
              <div style="padding: 40px 30px; text-align: center;">
                <h2 style="color: #111827; margin: 0 0 10px 0;">Welcome, ${user.name}!</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Thank you for registering. Please use the activation token below to verify your account and start booking movies.</p>
                
                <div style="margin: 35px 0; padding: 20px; background-color: #fef2f2; border: 2px dashed #fca5a5; border-radius: 12px; display: inline-block;">
                  <span style="font-size: 36px; font-weight: 900; color: #dc2626; letter-spacing: 8px; font-family: monospace;">
                    ${user.activationToken}
                  </span>
                </div>

                <p style="color: #9ca3af; font-size: 14px;">This code will expire shortly. Do not share this code with anyone.</p>
                <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 30px 0;">
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
                  If you didn't create an account, you can safely ignore this email.<br>
                  &copy; 2026 CineTix Administration.
                </p>
              </div>
            </div>
          </body>
        </html>`,
      });
    } catch (exception) {
      throw exception;
    }
  }

  async newUserWelcomeEmail(user) {
    try {
      return emailSvc.sendEmail({
        to: user.email,
        sub: "Welcome to CineTix!",
        msg: `
        <html>
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎬 Welcome to CineTix</h1>
              </div>
              <div style="padding: 40px 20px; text-align: center;">
                <h2 style="color: #333333; margin-top: 0;">Account Activated!</h2>
                <p style="color: #666666; font-size: 16px; line-height: 1.6;">Your account is active. You're ready to grab your popcorn and book the latest hits.</p>
                <div style="margin: 30px 0;">
                  <a href="${AppConfig.frontendUrl}/login" style="background-color: #dc2626; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">Start Booking</a>
                </div>
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                <p style="color: #999999; font-size: 14px;">Check out our "Upcoming Movies" section for early bird offers!</p>
              </div>
              <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                <p style="margin: 0;">&copy; 2026 CineTix. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>`
      });
    } catch (exception) {
      throw exception;
    }
  }

  createAuthData = async (data) => {
    try {
      const auth = new AuthModel(data);
      return await auth.save();
    } catch (exception) {
      throw exception;
    }
  };

  getSingleRowByFilter = async (filter) => {
    try {
      return await AuthModel.findOne(filter);
    } catch (exception) {
      throw exception;
    }
  };

  logoutUser = async (token) => {
    try {
      const accessToken = token.replace("Bearer ", "");
      const authData = await this.getSingleRowByFilter({ maskedAccessToken: accessToken });
      if (!authData) {
        throw { code: 401, message: "Token is not valid", status: "TOKEN_NOT_VALID" };
      }
      return await AuthModel.findOneAndDelete({ maskedAccessToken: accessToken });
    } catch (exception) {
      throw exception;
    }
  };

  logoutFromAll = async (filter) => {
    try {
      return await AuthModel.deleteMany(filter);
    } catch (exception) {
      throw exception;
    }
  };

  updateSingleRowByFilter = async (filter, data) => {
    try {
      return await AuthModel.findOneAndUpdate(filter, { $set: data }, { new: true });
    } catch (exception) {
      throw exception;
    }
  };

  sendPasswordResetRequestEmail = async (userData) => {
    try {
      return await emailSvc.sendEmail({
        to: userData.email,
        sub: "Password reset request",
        msg: `
        <html>
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #4b5563 0%, #1f2937 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 Reset Your Password</h1>
              </div>
              <div style="padding: 40px 20px;">
                <p style="color: #333333; font-size: 16px; line-height: 1.6;">Click the button below to safely reset your password. This link is valid for 3 hours.</p>
                <div style="margin: 30px 0; text-align: center;">
                  <a href="${AppConfig.nextjsUrl}/reset-password?token=${userData.forgetPasswordToken}" style="background-color: #dc2626; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">Reset Password</a>
                </div>
                <p style="color: #666666; font-size: 13px;">Link: ${AppConfig.nextjsUrl}/reset-password?token=${userData.forgetPasswordToken}</p>
                <p style="color: #666666; font-size: 14px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
              </div>
            </div>
          </body>
        </html>`,
      });
    } catch (exception) {
      throw exception;
    }
  };

  verifyPasswordResetToken = async (token) => {
    try {
      const userDetail = await userSvc.getSingleUserByFilter({ forgetPasswordToken: token });
      if (!userDetail) {
        throw { code: 422, message: "Token not found", status: "RESET_TOKEN_NOT_FOUND" };
      }
      if (userDetail.expiryTime.getTime() < Date.now()) {
        throw { code: 422, message: "Token has expired", status: "RESET_TOKEN_EXPIRED" };
      }
      return userDetail;
    } catch (exception) {
      throw exception;
    }
  };

  sendPasswordResetSuccessEmail = async (userData) => {
    try {
      return await emailSvc.sendEmail({
        to: userData.email,
        sub: "Password Reset Successful",
        msg: `
        <html>
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #059669; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Success!</h1>
              </div>
              <div style="padding: 40px 20px; text-align: center;">
                <p style="color: #333333; font-size: 16px;">Your password has been reset. You've been logged out from all other devices for your security.</p>
                <div style="margin: 30px 0;">
                  <a href="${AppConfig.frontendUrl}/login" style="background-color: #059669; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Login Again</a>
                </div>
              </div>
            </div>
          </body>
        </html>`,
      });
    } catch (exception) {
      throw exception;
    }
  };
}

module.exports = new AuthService();