const upcomingMovieSvc = require("./upcomingmovie.service");

class UpcomingMovieController {
  async createUpcomingMovie(req, res, next) {
    try {
      const payload = await upcomingMovieSvc.transformCreateData(req);
      const movie = await upcomingMovieSvc.create(payload);

      res.json({
        data: movie,
        message: "Upcoming movie created successfully",
        status: "UPCOMING_MOVIE_CREATED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async listAllUpcomingMovies(req, res, next) {
    try {
      let filter = {};
      if (req.query.search) {
        filter.title = new RegExp(req.query.search, "i");
      }
      if (req.query.status) {
        filter.status = req.query.status;
      }
      const { data, pagination } = await upcomingMovieSvc.listAllRowsByFilter(
        req.query,
        filter,
      );

      res.json({
        data,
        message: "Upcoming movie list fetched successfully",
        status: "UPCOMING_MOVIE_LIST_FETCHED",
        options: { pagination },
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getUpcomingMovieDetailsById(req, res, next) {
    try {
      const movie = await upcomingMovieSvc.getSingleRowByFilter({
        _id: req.params.movieId,
      });
      if (!movie) {
        return res.status(404).json({
          data: null,
          message: "Upcoming movie not found",
          status: "UPCOMING_MOVIE_NOT_FOUND",
          options: null,
        });
      }
      res.json({
        data: movie,
        message: "Upcoming movie details fetched",
        status: "UPCOMING_MOVIE_DETAILS_FETCHED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async updateUpcomingMovieById(req, res, next) {
    try {
      const oldMovie = await upcomingMovieSvc.getSingleRowByFilter({
        _id: req.params.movieId,
      });

      const payload = await upcomingMovieSvc.transformUpdateData(req, oldMovie);

      const update = await upcomingMovieSvc.updateSingleRowByFilter(
        { _id: req.params.movieId },
        payload,
      );

      res.json({
        data: update,
        message: "Upcoming movie updated successfully",
        status: "UPCOMING_MOVIE_UPDATED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async deleteUpcomingMovieById(req, res, next) {
    try {
      const deleted = await upcomingMovieSvc.deleteSingleRowByFilter({
        _id: req.params.movieId,
      });

      res.json({
        data: deleted,
        message: "Upcoming movie deleted successfully",
        status: "UPCOMING_MOVIE_DELETED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }
}

const upcomingMovieCtrl = new UpcomingMovieController();
module.exports = upcomingMovieCtrl;