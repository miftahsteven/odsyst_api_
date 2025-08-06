const multer = require("multer");
const path = require("path");

const dest = path.resolve(__dirname, "../../uploads/cv/");
//const destCV = path.resolve(__dirname, "../../uploads/cv/");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25000000 }, // 25MB
});

// const storageCV = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, destCV);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const uploadcv = multer({
//   storageCV,
//   limits: { fileSize: 5000000 },
// });

module.exports = {
  upload,
  //dest
  // uploadcv,
};
