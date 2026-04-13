const multer = require("multer");
const fs = require("fs");
const { randomStringGenerator } = require("../utilities/helper.js");

const myStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let filePath = "./public/uploads";
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, { recursive: true });
        }
        cb(null, filePath)
    },
    filename: (req, file, cb) => {
        let filename =randomStringGenerator(15)+"-"+ file.originalname;
        cb(null, filename);
    },
})

const uploader = (type = 'image') => {
    const uploaderConfig = {
        fileSize: 3000000,
        fileFilter: function (req, file, cb) {
            let allowedExts = ['jpg', 'jpeg', 'png', 'gif','svg','webp','bmp'];
            if(type === "doc"){
               this.fileSize = 50000000;
               allowedExts = ['pdf', 'doc', 'docx', 'xls', 'csv', 'json', 'xlsx'];
            }else if(type === 'audio'){
                this.fileSize = 70000000;
                allowedExts = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
            }
            const fileExt = file.originalname.split(".").pop()
            if(allowedExts.includes(fileExt.toLowerCase())){
                cb(null, true);
            }else{
                cb({code: 422, message: "Unsupported file type", status: "INVALID_FILE_TYPE"});
            }
        },
    }
    return multer({
        storage: myStorage,
        fileFilter: uploaderConfig.fileFilter,
        limits: { fileSize: uploaderConfig.fileSize },
    })
}

module.exports = uploader;