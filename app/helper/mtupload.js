const multer = require("multer");
const path = require("path");

const dest = path.resolve(__dirname, "../../uploads/");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  },
});

const mtupload = multer({
  storage,
  limits: { fileSize: 5000000 },
});

module.exports = {
  mtupload,
};
