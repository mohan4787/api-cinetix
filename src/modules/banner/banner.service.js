const cloudinarySvc = require("../../services/cloudinary.service");
const BannerModel = require("./banner.model");
const BaseService = require("../../services/base.service");

class bannerService extends BaseService {
  async transformBannerCreateData(req) {
    try {
      const data = req.body;
      data.createdBy = req.loggedInUser._id;
      if (req.file) {
        data.image = await cloudinarySvc.fileUpload(req.file.path, "/banner/");
      }
      return data;
    } catch (exception) {
      throw exception;
    }
  }
  async transformUpdateBannerData(req, banner) {
    try {
      const data = req.body;
      data.updatedBy = req.loggedInUser._id;
      if (req.file) {
        data.image = await cloudinarySvc.fileUpload(req.file.path, "/banner/");
      } else {
        data.image = banner.image;
      }
      return data;
    } catch (exception) {
      throw exception;
    }
  }

  publicBannerData = (row) => {
    return {
      _id: row._id,
      title: row.title,
      link: row.link,
      status: row.status,
      image: row.image.optimizedUrl || null,
    };
  };
  async listAllRowsByFilter(query, filter = {}) {
    try {
      const page = +query.page || 1;
      const limit = +query.limit || 10;
      const skip = (page - 1) * limit;
      const data = await this.model
        .find()
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
        data: data.map(this.publicBannerData),
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

  getDetail = async (id) => {
    try {
      const data = await BannerModel.findById(id);
      if (!data) {
        throw {
          code: 404,
          message: "Banner not found",
        };
      }
      return data;
    } catch (exception) {
      throw exception;
    }
  };
}

const bannerSvc = new bannerService(BannerModel);
module.exports = bannerSvc;
