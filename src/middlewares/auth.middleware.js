const { AppConfig } = require("../config/config");
const { USER_ROLES } = require("../config/constants");
const authSvc = require("../modules/auth/auth.service");
const userSvc = require("../modules/user/user.service");
const jwt = require("jsonwebtoken");

const auth = (role = null) => {
  return async (req, res, next) => {
    try {
      let token = req.headers["authorization"] || null;

      if (!token) {
        throw {
          code: 401,
          message: "Unauthorized access. Token missing.",
          status: "UNAUTHORIZED",
        };
      }
      token = token.replace("Bearer ", "");
      const authData = await authSvc.getSingleRowByFilter({
        maskedAccessToken: token,
      });
      if (!authData) {
        throw {
          code: 401,
          message: "Token not found",
          status: "UNDEFINED_TOKEN",
        };
      }
      const data = jwt.verify(authData.accessToken, AppConfig.jwtSecret);
      if (data.typ !== "Bearer") {
        throw {
          code: 401,
          message: "Bearer token expected",
          status: "BEARER_TOKEN_EXPECTED",
        };
      }
      let userDetail = await userSvc.getSingleUserByFilter({
        _id: data.sub,
      });
      if (!userDetail) {
        throw {
          code: 403,
          message: "User not found or may have been deleted from the system",
          status: "USER_NOT_FOUND",
        };
      }
      userDetail = userSvc.getUserPublicProfile(userDetail);
      req.loggedInUser = userDetail;

      if (
        userDetail.role === USER_ROLES.ADMIN ||
        role === null ||
        (Array.isArray(role) && role.includes(userDetail.role))
      ) {
        next();
      } else {
        throw {
          code: 403,
          message:
            "Access denied. You do not have permission to access this resource.",
          status: "ACCESS_DENIED",
        };
      }
    } catch (exception) {
     if(exception.hasOwnProperty('name') && exception.name === "TokenExpiredError"){
        next({
            code: 401,
            message: exception.message,
            status: "TOKEN_EXPIRED"
        })
      }else {
        next(exception);
      }
    }
  };
};
module.exports = auth;
