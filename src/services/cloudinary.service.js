const { AppConfig } = require("../config/config");
const { deleteFile } = require("../utilities/helper");
const cloudinary = require("cloudinary").v2;

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: AppConfig.cloudinaryCloudName,
      api_key: AppConfig.cloudinaryApiKey,
      api_secret: AppConfig.cloudinaryApiSecret,
    });
  }

  fileUpload = async (filePath, dir = "/") => {
    try {
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        filePath,
        {
          unique_filename: true,
          folder: "/api-movieticket" + dir,
          resource_type: "auto",
        },
      );
      deleteFile(filePath)
      const optimized = cloudinary.url(public_id, {
        transformation: [
          { width: 500, crop: "scale" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
      return {
        publicId: public_id,
        secureUrl:secure_url,
        optimizedUrl: optimized,
      };
    } catch (exception) {
      console.log(exception);
      throw {
        code: 500,
        message: "File upload error on cloudinary",
        status: "FILE_UPLOAD_ERROR",
      };
    }
  };
}

const cloudinarySvc = new CloudinaryService();
module.exports = cloudinarySvc;
