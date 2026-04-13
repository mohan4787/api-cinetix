const { USER_ROLES } = require("../../config/constants");
const auth = require("../../middlewares/auth.middleware");
const bodyValidator = require("../../middlewares/request-validate.middleware");
const uploader = require("../../middlewares/uploader.middleware");
const bannerCtrl = require("./banner.controller");
const { BannerCreateDTO, BannerUpdateDTO } = require("./banner.validator");

const bannerRouter = require("express").Router()



bannerRouter.route("/")
  .post(auth([USER_ROLES.ADMIN]), uploader().single("image"), bodyValidator(BannerCreateDTO), bannerCtrl.createBanner)
  .get(bannerCtrl.listAllBanners)

bannerRouter.route("/:bannerId")
  .get(bannerCtrl.getBannerDetailsById) 
  .put(auth([USER_ROLES.ADMIN]), uploader().single("image"), bodyValidator(BannerUpdateDTO), bannerCtrl.updateBannerById) 
  .delete(auth([USER_ROLES.ADMIN]), bannerCtrl.deleteBannerById)
module.exports = bannerRouter;