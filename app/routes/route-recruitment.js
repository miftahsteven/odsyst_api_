const router = require("express").Router();
const { recruitment } = require("../controllers");
const multer = require("multer");
//const upload = multer({ dest: './uploads/uploadcv/' })
const { upload } = require("../helper/upload");
const { authentication, authorization } = require("../../config/auth");

// GET localhost:8080/home => Ambil data semua dari awal
router.get("/all-position", authentication, recruitment.getPosition);
router.get("/all-vacant-position", authentication, recruitment.getPositionVacant);
router.post("/tambah", authentication, recruitment.createPosition);
router.put("/update/:id", authentication, recruitment.updatePosition);
router.delete("/delete", authentication, recruitment.deletePosition);

router.get("/all", authentication, recruitment.getAllRecruitment);
router.get("/position/:id", authentication, recruitment.getPositionById);
router.post("/apply", authentication, upload.single("cv_uploaded"), recruitment.applyPosition);
router.put("/applyupdate/:id", authentication, upload.single("cv_uploaded"), recruitment.editApplyPosition);
router.put("/changestatus/:id", authentication, recruitment.updateStatusRecruitement);
router.get("/interviewer", authentication, recruitment.getUserInterviewer);
router.post("/approved/:id", authentication, recruitment.approveRecruitment);
router.put("/change-approval/:id", authentication, recruitment.updateApprovalRecruitment);
router.get("/approver", authentication, recruitment.getAllApprovalProcess);

//router.put("/update", authentication, role.updateRole);


module.exports = router;
