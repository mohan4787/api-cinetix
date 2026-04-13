const express = require("express");
require("./mongodb.config");
const router = require("./router.config");
const { deleteFile } = require("../utilities/helper");
const cors = require("cors")
const helmet = require("helmet")
const {rateLimit} = require("express-rate-limit")
const app = express();

app.use(cors({
  origin:"*"
}))
app.use(rateLimit({
  windowMs:60000,
  limit:30
}))
app.use(helmet())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);
app.use((req, res, next) => {
  next({
    code: 404,
    message: "Router not found",
    status: "NOT_FOUND",
  });
});

app.use((err, req, res, next) => {
  let code = err.statusCode || 500;
  let detail = err.detail || null;
  let msg = err.message || "Internal Server Error...";
  let status = err.status || "SERVER_ERROR";

  if(req.file) {
    deleteFile(req.file.path)
  }else if(req.files){
    req.files.forEach((file) => {
      deleteFile(file.path)
    })
  }

   if(err.name === "MongoServerError") {
    if(+err.code === 11000) {
      msg = "Validation Failed";
      code = 400;
      status = "VALIDATION_ERROR";
      detail = {};
      (Object.keys(err.keyValue)).map((key) => {
        detail[key] = `${key} already exists. Please choose another.`
      })
    }
  }

  res.status(code).json({
    error: detail,
    message: msg,
    status:status,
    options: null,
  });
});

module.exports = app;
