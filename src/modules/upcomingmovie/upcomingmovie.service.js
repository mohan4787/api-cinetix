const { default: slugify } = require("slugify");
const cloudinarySvc = require("../../services/cloudinary.service");
const UpcomingMovieModel = require("./upcomingmovie.model");
const BaseService = require("../../services/base.service");

class UpcomingMovieService extends BaseService {
  async transformCreateData(req) {
    try {
      const data = req.body;

      data.createdBy = req.loggedInUser._id;

      if (req.file) {
        data.poster = await cloudinarySvc.fileUpload(req.file.path, "/upcoming-movie/");
      }

      data.slug = slugify(data.title.replace("'", "").replace('"', ""), {
        lower: true,
      });

      return data;
    } catch (exception) {
      throw exception;
    }
  }

  async transformUpdateData(req, oldData) {
    try {
      const data = req.body;

      data.updatedBy = req.loggedInUser._id;

      if (req.file) {
        data.poster = await cloudinarySvc.fileUpload(req.file.path, "/upcoming-movie/");
      } else {
        data.poster = oldData.poster;
      }

      return data;
    } catch (exception) {
      throw exception;
    }
  }

  publicMovieData = (row) => {
    return {
      _id: row._id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      genre: row.genre,
      duration: row.duration,
      language: row.language,
      expectedReleaseDate: row.expectedReleaseDate,
      teaserUrl: row.teaserUrl || null,
     // preBookingAvailable: row.preBookingAvailable || false,
      status: row.status,
      poster: row.poster || null,

      createdBy: row.createdBy
        ? {
            _id: row.createdBy._id,
            title: row.createdBy.title,
            email: row.createdBy.email,
            role: row.createdBy.role,
            status: row.createdBy.status,
            image: row.createdBy.image?.optimizedUrl || null,
          }
        : null,
    };
  };

  async listAllRowsByFilter(query, filter = {}) {
    try {
      const page = +query.page || 1;
      const limit = +query.limit || 10;
      const skip = (page - 1) * limit;

      const data = await this.model
        .find(filter)
        .populate("createdBy", [
          "_id",
          "title",
          "email",
          "image",
          "role",
          "status",
        ])
        .populate("updatedBy", [
          "_id",
          "title",
          "email",
          "image",
          "role",
          "status",
        ])
        .sort({ createdAt: "desc" })
        .skip(skip)
        .limit(limit);

      const count = await this.model.countDocuments(filter);

      return {
        data: data.map(this.publicMovieData),
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

const upcomingMovieSvc = new UpcomingMovieService(UpcomingMovieModel);

module.exports = upcomingMovieSvc;