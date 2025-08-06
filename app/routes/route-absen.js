const router = require("express").Router();
const { absen } = require("../controllers");
const multer = require("multer");
//const upload = multer({ dest: './uploads/absen/' })
const { upload } = require("../helper/upload-absen");
const { authentication, authorization } = require("../../config/auth");

// GET localhost:8080/home => Ambil data semua dari awal


router.post("/in", authentication, upload.single("picture"),  absen.createAbsenIn);
router.post("/out", authentication, absen.createAbsenOut);


module.exports = router;
