const { USER_ROLES } = require("../../config/constants");
const auth = require("../../middlewares/auth.middleware");
const bodyValidator = require("../../middlewares/request-validate.middleware");
const uploader = require("../../middlewares/uploader.middleware");
const upcomingMovieCtrl = require("./upcomingmovie.controller");
const { UpcomingMovieCreateDTO, UpcomingMovieUpdateDTO } = require("./upcomingmovie.validator");

const upcomingMovieRouter = require("express").Router();

upcomingMovieRouter.route("/")
  .post(
    auth([USER_ROLES.ADMIN]),
    uploader().single("poster"),
    bodyValidator(UpcomingMovieCreateDTO),
    upcomingMovieCtrl.createUpcomingMovie
  )
  .get(upcomingMovieCtrl.listAllUpcomingMovies);

upcomingMovieRouter.route("/:movieId")
  .get(upcomingMovieCtrl.getUpcomingMovieDetailsById)
  .put(
    auth([USER_ROLES.ADMIN]),
    uploader().single("poster"),
    bodyValidator(UpcomingMovieUpdateDTO),
    upcomingMovieCtrl.updateUpcomingMovieById
  )
  .delete(
    auth([USER_ROLES.ADMIN]),
    upcomingMovieCtrl.deleteUpcomingMovieById
  );

module.exports = upcomingMovieRouter;