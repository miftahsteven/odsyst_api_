const router = require("express").Router();
const { user } = require("../controllers");
const multer = require("multer");
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");

// GET localhost:8080/home => Ambil data semua dari awal
router.post("/login", user.loginUser);
router.post("/register", user.registerUser);
router.put("/update", authentication, user.updateUser);
router.post("/verifed", user.verifiedUser);
router.put("/password", authentication, user.updatePasswordWithAuth);
router.post("/resetpassword", user.resetPassword);
router.post("/forgot-password", user.forgotPassword);

module.exports = router;
