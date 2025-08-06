const router = require("express").Router();
const { leaving } = require("../controllers");
const multer = require("multer");
//const upload = multer({ dest: './uploads/uploadcv/' })
const { upload } = require("../helper/upload");
const { authentication, authorization } = require("../../config/auth");

// GET localhost:8080/home => Ambil data semua dari awal
router.get("/all", authentication, leaving.getAllLeaving);
router.post("/request", authentication, leaving.leaving);
router.get("/detail", authentication, leaving.getLeavingDetailWithAllUser);
router.put("/approve", authentication, leaving.approvalLeaving);
router.get("/history/usersession", authentication, leaving.getLeavingDetailByUserId);
router.get("/history", authentication, leaving.getLeavingDetailByUserIdParams);
router.get("/history/all", authentication, leaving.getLeavingDetailWithAllUserDistinct);

//router.put("/update", authentication, role.updateRole);


module.exports = router;
