const router = require("express").Router();
const { user } = require("../controllers");
const multer = require("multer");
//const upload = multer({ dest: './uploads/reports/' })
const { authentication, authorization } = require("../../config/auth");

// GET localhost:8080/home => Ambil data semua dari awal
router.post("/login", user.loginUser);
router.post("/logout", authentication, user.logout);
router.post("/register", user.registerUser);
router.put("/update", authentication, user.updateUser);
router.put("/updateuser/:id", authentication, user.updateUseOnAdmin);
router.post("/inactivated", authentication, user.inactiveUser);
router.delete("/remove", authentication, user.removeUser);
router.post("/verifed", user.verifiedUser);
router.put("/password", authentication, user.updatePasswordWithAuth);
router.post("/resetpassword", user.resetPassword);
router.post("/forgot-password", user.forgotPassword);

router.get("/all-user", authentication, user.getAllUser);
router.get("/all-user-inactive", authentication, user.getAllUserInactive);
router.get("/all-type", authentication, user.getDataTypeUser);
// router.get("/all-activity", authentication, user.getAllActivity);

module.exports = router;
