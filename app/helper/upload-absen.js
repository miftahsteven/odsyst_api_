const multer = require("multer");
const path = require("path");

const dest = path.resolve(__dirname, "../../uploads/absen/");
//const destCV = path.resolve(__dirname, "../../uploads/cv/");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      return cb(new Error("Hanya Boleh Mengupload Gambar!"));
    }
    cb(null, true);
  }
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
