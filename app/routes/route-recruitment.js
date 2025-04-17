const router = require("express").Router();
const { recruitment } = require("../controllers");
const multer = require("multer");
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");

// GET localhost:8080/home => Ambil data semua dari awal
router.get("/all-position", authentication, recruitment.getPosition);
router.get("/all-vacant-position", authentication, recruitment.getPositionVacant);
router.post("/tambah", authentication, recruitment.createPosition);
router.put("/update/:id", authentication, recruitment.updatePosition);
router.delete("/delete", authentication, recruitment.deletePosition);

router.get("/all", authentication, recruitment.getAllRecruitment);
router.get("/position/:id", authentication, recruitment.getPositionById);

//router.put("/update", authentication, role.updateRole);


module.exports = router;
