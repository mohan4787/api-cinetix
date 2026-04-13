const ShowTimeModel = require("./showtime.model");
const BaseService = require("../../services/base.service")

class ShowTimeService extends BaseService {
  async transformShowTimeCreateData(req) {
    try {
       const data = req.body;
       data.createdBy = req.loggedInUser._id;
       return data; 
    } catch (exception) {
        throw exception
    }
  }
   async transformUpdateShowTimeData(req, oldData) {
    try {
      const data = req.body;
      data.updatedBy = req.loggedInUser._id;
      return data;
    } catch (exception) {
      throw exception;
    }
  }

  publicShowTimeData = (row) => {
    return {
      _id: row._id,
      movieId: row.movieId,
      screen: row.screen,
      price: row.price,
      date: row.date,
      startTime: row.startTime,
      endTime: row.endTime,
      language: row.language,
      seats: row.seats,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  };

  async listAllRowsByFilter(query, filter = {}) {
    try {
      const page = +query.page || 1;
      const limit = +query.limit || 10;
      const skip = (page - 1) * limit;

      const data = await this.model
        .find(filter)
        .populate("movieId", ["_id", "title", "slug", "poster"])
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(limit);

      const count = await this.model.countDocuments(filter);

      return {
        data: data.map(this.publicShowTimeData),
        pagination: {
          current: page,
          limit: limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (exception) {
      throw exception;
    }
  }
}

const showtimeSvc = new ShowTimeService(ShowTimeModel);
module.exports = showtimeSvc;