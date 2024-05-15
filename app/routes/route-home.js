const router = require("express").Router();
const { home } = require("../controllers");
const path = require("path");
const { authentication, authorization } = require("../../config/auth");
const { upload } = require("../helper/upload");

// GET localhost:8080/home => Ambil data semua dari awal
router.get("/program", home.getAllProgram);
router.get("/banner", home.getBanner);
router.get("/program/:id", home.getProgramById);
router.post("/createprogram", authentication, upload.single("banner"), home.registerProgram);

module.exports = router;
