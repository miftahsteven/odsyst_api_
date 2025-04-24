const router = require("express").Router();
const { reference } = require("../controllers");
const multer = require("multer");
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");

// GET localhost:8080/home => Ambil data semua dari awal
router.get("/dept-all", authentication, reference.getDepartement);
router.get("/provinces", authentication, reference.getProvinces);
router.get("/cities", authentication, reference.getCities);
router.get("/districts", authentication, reference.getDistricts);
router.get("/locations", authentication, reference.getLocations);


module.exports = router;
