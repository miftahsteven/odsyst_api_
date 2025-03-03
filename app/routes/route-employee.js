const router = require("express").Router();
const { emp, user } = require("../controllers");
const multer = require("multer");
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");

// GET localhost:8080/home => Ambil data semua dari awal
router.post("/update", authentication, emp.updateEmployee);
router.post("/register", authentication, user.registerUser);
router.post("/detail/:id", authentication, user.getDataTypeUser);

router.get("/all-activity/:id", authentication, user.getAllActivity);
module.exports = router;
