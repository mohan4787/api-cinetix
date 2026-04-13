const movieSvc = require("./movie.service");

class MovieController {
  async createMovie(req, res, next) {
    try {
      const payload = await movieSvc.transformMovieCreateData(req);
      const movie = await movieSvc.create(payload);

      res.json({
        data: movie,
        message: "Movie created successfully",
        status: "MOVIE_CREATED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async listAllMovies(req, res, next) {
    try {
      let filter = {};
      if (req.query.search) {
        filter.title = new RegExp(req.query.search, "i");
      }
      if (req.query.status) {
        filter.status = req.query.status;
      }
      const { data, pagination } = await movieSvc.listAllRowsByFilter(
        req.query,
        filter,
      );

      res.json({
        data,
        message: "Movie list fetched successfully",
        status: "MOVIE_LIST_FETCHED",
        options: { pagination },
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getMovieDetailsById(req, res, next) {
    try {
      const movie = await movieSvc.getSingleRowByFilter({
        _id: req.params.movieId,
      });
      if (!movie) {
        return res.status(404).json({
          data: null,
          message: "Movie not found",
          status: "MOVIE_NOT_FOUND",
          options: null,
        });
      }
      res.json({
        data: movie,
        message: "Movie details fetched",
        status: "MOVIE_DETAILS_FETCHED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async updateMovieById(req, res, next) {
    try {
      const oldMovie = await movieSvc.getSingleRowByFilter({
        _id: req.params.movieId,
      });

      const payload = await movieSvc.transformUpdateMovieData(req, oldMovie);

      const update = await movieSvc.updateSingleRowByFilter(
        { _id: req.params.movieId },
        payload,
      );

      res.json({
        data: update,
        message: "Movie updated successfully",
        status: "MOVIE_UPDATED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async deleteMovieById(req, res, next) {
    try {
      const deleted = await movieSvc.deleteSingleRowByFilter({
        _id: req.params.movieId,
      });

      res.json({
        data: deleted,
        message: "Movie deleted successfully",
        status: "MOVIE_DELETED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
}

const movieCtrl = new MovieController();
module.exports = movieCtrl;
