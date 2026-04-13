const { USER_ROLES } = require("../../config/constants")
const auth = require("../../middlewares/auth.middleware")
const bodyValidator = require("../../middlewares/request-validate.middleware")
const uploader = require("../../middlewares/uploader.middleware")
const movieCtrl = require("./movie.controller")
const { MovieCreateDTO, MovieUpdateDTO } = require("./movie.validator")

const movieRouter = require("express").Router();

movieRouter.route("/")
 .post(auth([USER_ROLES.ADMIN]), uploader().single("poster"), bodyValidator(MovieCreateDTO), movieCtrl.createMovie)
 .get(movieCtrl.listAllMovies)

 movieRouter.route("/:movieId")
   .get(movieCtrl.getMovieDetailsById)
   .put(auth([USER_ROLES.ADMIN]), uploader().single("poster"), bodyValidator(MovieUpdateDTO), movieCtrl.updateMovieById)
   .delete(auth([USER_ROLES.ADMIN]), movieCtrl.deleteMovieById)

module.exports = movieRouter;