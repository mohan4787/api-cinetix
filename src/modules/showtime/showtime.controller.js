const { generateSeat } = require("../../utilities/helper");
const ShowTimeModel = require("./showtime.model");
const showtimeSvc = require("./showtime.service");


class ShowTimeController {

  async createShowTime(req, res, next) {
    try {
      let payload = await showtimeSvc.transformShowTimeCreateData(req);

      payload.seats = generateSeat(payload.screen);

      const showtime = await showtimeSvc.create(payload);

      res.json({
        data: showtime,
        message: "ShowTime created successfully",
        status: "SHOWTIME_CREATED",
        options: null,
      });

    } catch (exception) {
      next(exception);
    }
  }

  async listAllShowTimes(req, res, next) {
    try {
      let filter = {};
      if (req.query.movieId) filter.movieId = req.query.movieId;
      if (req.query.date) filter.date = new Date(req.query.date);
      if (req.query.status) filter.status = req.query.status;

      const { data, pagination } = await showtimeSvc.listAllRowsByFilter(
        req.query,
        filter
      );

      res.json({
        data,
        message: "ShowTime list fetched successfully",
        status: "SHOWTIME_LIST_FETCHED",
        options: { pagination },
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getShowTimeById(req, res, next) {
    try {;
      const showtime = await ShowTimeModel.findById(req.params.showtimeId)
      .populate("movieId", "title poster")

      if (!showtime) {
        return res.status(404).json({
          data: null,
          message: "ShowTime not found",
          status: "SHOWTIME_NOT_FOUND",
          options: null,
        });
      }

      res.json({
        data: showtime,
        message: "ShowTime details fetched",
        status: "SHOWTIME_DETAILS_FETCHED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async updateShowTimeById(req, res, next) {
    try {
      const oldShowTime = await showtimeSvc.getSingleRowByFilter({
        _id: req.params.showtimeId,
      });

      if (!oldShowTime) {
        return res.status(404).json({
          data: null,
          message: "ShowTime not found",
          status: "SHOWTIME_NOT_FOUND",
          options: null,
        });
      }

      let payload = await showtimeSvc.transformUpdateShowTimeData(
        req,
        oldShowTime
      );
      if (payload.screen && payload.screen !== oldShowTime.screen) {
        payload.seats = generateSeat(payload.screen);
      }

      const update = await showtimeSvc.updateSingleRowByFilter(
        { _id: req.params.showtimeId },
        payload
      );

      res.json({
        data: update,
        message: "ShowTime updated successfully",
        status: "SHOWTIME_UPDATED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

async deleteShowTimeById(req, res, next) {
  try {
    const { _id } = req.params; 
    console.log("id:",_id);

    const response = await ShowTimeModel.findByIdAndDelete(_id);

    if (!response) {
      return res.status(404).json({
        data: null,
        message: "ShowTime not found",
        status: "NOT_FOUND"
      });
    }

    res.json({
      data: response,
      message: "ShowTime deleted successfully",
      status: "SHOWTIME_DELETED",
      options: null,
    });
  } catch (exception) {
    // This will now catch actual database errors instead of casting errors
    next(exception);
  }
}

  async getShowTimesByMovie(req, res, next) {
    try {
      const showtimes = await showtimeSvc.listAllRowsByFilter({
        movieId: req.params.movieId,
        status: "active",
      });

      res.json({
        data: showtimes.data,
        message: "ShowTimes fetched for movie",
        status: "SHOWTIME_BY_MOVIE_FETCHED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getShowTimesByShowTimeId(req, res, next) {
  try {
     const showtimeId = req.params.showtimeId;

      const showtime = await showtimeSvc.getSingleRowByFilter({
        _id: showtimeId,
        status: "active",
      });
      if(!showtime) {
        throw{
          status: 404,
          message: "ShowTime not found"
        }
      }
      res.json({
        data: showtime,
        message: "ShowTime fetched successfully",
        status: "SHOWTIME_FETCHED",
        options: null,
      })
  } catch (exception) {
    throw exception;
  }
  }

  async getShowTimesByDate(req, res, next) {
    try {
      const date = new Date(req.params.date);

      const showtimes = await showtimeSvc.listAllRowsByFilter({
        date: date,
        status: "active",
      });

      res.json({
        data: showtimes.data,
        message: "ShowTimes fetched for date",
        status: "SHOWTIME_BY_DATE_FETCHED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async getAllShowTimeByMovieId(req, res, next) {
    try {
      const movieId = req.params.movieId;
      const getAllShowTime = await ShowTimeModel.find({ movieId: movieId });

      res.json({
        data: getAllShowTime,
        message: "Fetched all data successfully!!",
        status: "SHOWTIME_LIST_FETCHED",
        options: {
          pagination: {
            current: 1,
            limit: getAllShowTime.length,
            total: getAllShowTime.length,
          },
        },
      });
    } catch (exception) {
      next(exception);
    }
  }
}

const showtimeCtrl = new ShowTimeController();
module.exports = showtimeCtrl;